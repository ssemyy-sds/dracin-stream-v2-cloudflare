/**
 * Fetch Wrapper with Rate Limiting, Caching, and Retry Logic
 * Framework-agnostic implementation for API request management
 */

import { getRateLimitConfig, getLocalizedMessage, type RateLimitConfig } from '$lib/config/rateLimitConfig';
import { rateLimitStore } from '$lib/stores/rateLimitStore';

// ============= TYPES =============

export interface FetchOptions {
    cacheKey?: string;
    cacheable?: boolean;
    skipQueue?: boolean;
    timeout?: number;
}

export interface FetchLogger {
    onRequest?(url: string, attempt: number): void;
    onCacheHit?(url: string): void;
    onRateLimited?(retryAfter: number): void;
    onRetry?(url: string, attempt: number, waitMs: number): void;
    onSuccess?(url: string, durationMs: number): void;
    onFailure?(url: string, error: Error): void;
    onQueueStatus?(pending: number, active: number): void;
}

interface CacheEntry {
    response: Response;
    data: any;
    timestamp: number;
}

// ============= TOKEN BUCKET RATE LIMITER =============

class TokenBucket {
    private tokens: number;
    private lastRefill: number;
    private readonly tokensPerMs: number;

    constructor(private config: RateLimitConfig) {
        this.tokens = config.requestsPerMinute;
        this.lastRefill = Date.now();
        this.tokensPerMs = config.requestsPerMinute / 60000; // tokens per millisecond
    }

    private refill(): void {
        const now = Date.now();
        const elapsed = now - this.lastRefill;
        const newTokens = elapsed * this.tokensPerMs;

        this.tokens = Math.min(
            this.config.requestsPerMinute,
            this.tokens + newTokens
        );
        this.lastRefill = now;
    }

    async acquire(): Promise<void> {
        this.refill();

        if (this.tokens >= 1) {
            this.tokens -= 1;
            return;
        }

        // Calculate wait time for next token
        const tokensNeeded = 1 - this.tokens;
        const waitMs = Math.ceil(tokensNeeded / this.tokensPerMs);

        await this.sleep(waitMs);
        this.refill();
        this.tokens -= 1;
    }

    getAvailableTokens(): number {
        this.refill();
        return Math.floor(this.tokens);
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ============= REQUEST QUEUE =============

interface QueuedRequest {
    execute: () => Promise<Response>;
    resolve: (response: Response) => void;
    reject: (error: Error) => void;
}

class RequestQueue {
    private queue: QueuedRequest[] = [];
    private activeCount = 0;
    private logger?: FetchLogger;

    constructor(
        private config: RateLimitConfig,
        logger?: FetchLogger
    ) {
        this.logger = logger;
    }

    async enqueue(execute: () => Promise<Response>): Promise<Response> {
        // Check queue overflow
        if (this.queue.length >= this.config.maxQueueSize) {
            const error = new Error(getLocalizedMessage('queueFull'));
            (error as any).isQueueOverflow = true;
            throw error;
        }

        return new Promise<Response>((resolve, reject) => {
            this.queue.push({ execute, resolve, reject });
            this.processQueue();
        });
    }

    private async processQueue(): Promise<void> {
        if (this.activeCount >= this.config.maxConcurrentRequests) {
            return;
        }

        const request = this.queue.shift();
        if (!request) {
            return;
        }

        this.activeCount++;
        this.logger?.onQueueStatus?.(this.queue.length, this.activeCount);

        try {
            const response = await request.execute();
            request.resolve(response);
        } catch (error) {
            request.reject(error as Error);
        } finally {
            this.activeCount--;
            this.logger?.onQueueStatus?.(this.queue.length, this.activeCount);

            // Process next item
            if (this.queue.length > 0) {
                this.processQueue();
            }
        }
    }

    getPendingCount(): number {
        return this.queue.length;
    }

    getActiveCount(): number {
        return this.activeCount;
    }
}

// ============= IN-FLIGHT DEDUPLICATOR =============

class InFlightDeduplicator {
    private inFlight = new Map<string, Promise<{ response: Response; data: any }>>();

    async dedupe(
        key: string,
        execute: () => Promise<{ response: Response; data: any }>
    ): Promise<{ response: Response; data: any }> {
        // Check if request is already in flight
        const existing = this.inFlight.get(key);
        if (existing) {
            return existing;
        }

        // Create new request promise
        const promise = execute().finally(() => {
            this.inFlight.delete(key);
        });

        this.inFlight.set(key, promise);
        return promise;
    }

    has(key: string): boolean {
        return this.inFlight.has(key);
    }
}

// ============= RESPONSE CACHE =============

class ResponseCache {
    private cache = new Map<string, CacheEntry>();

    constructor(private ttlMs: number) { }

    get(key: string): { response: Response; data: any } | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Check if expired
        if (Date.now() - entry.timestamp > this.ttlMs) {
            this.cache.delete(key);
            return null;
        }

        // Return cloned response with cached data
        return {
            response: entry.response.clone(),
            data: entry.data
        };
    }

    set(key: string, response: Response, data: any): void {
        this.cache.set(key, {
            response: response.clone(),
            data,
            timestamp: Date.now()
        });

        // Cleanup old entries periodically
        if (this.cache.size > 100) {
            this.cleanup();
        }
    }

    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.ttlMs) {
                this.cache.delete(key);
            }
        }
    }

    clear(): void {
        this.cache.clear();
    }
}

// ============= FETCH WRAPPER SINGLETON =============

class FetchWrapper {
    private tokenBucket: TokenBucket;
    private requestQueue: RequestQueue;
    private deduplicator: InFlightDeduplicator;
    private cache: ResponseCache;
    private config: RateLimitConfig;
    private logger?: FetchLogger;

    constructor(config?: Partial<RateLimitConfig>, logger?: FetchLogger) {
        this.config = getRateLimitConfig(config);
        this.logger = logger;
        this.tokenBucket = new TokenBucket(this.config);
        this.requestQueue = new RequestQueue(this.config, logger);
        this.deduplicator = new InFlightDeduplicator();
        this.cache = new ResponseCache(this.config.cacheTtlMs);
    }

    async fetch(url: string, init?: RequestInit, options?: FetchOptions): Promise<Response> {
        const cacheKey = options?.cacheKey || url;
        const isCacheable = options?.cacheable !== false && (!init?.method || init.method === 'GET');

        // 1. Check cache first
        if (isCacheable) {
            const cached = this.cache.get(cacheKey);
            if (cached) {
                this.logger?.onCacheHit?.(url);
                return cached.response;
            }
        }

        // 2. Use deduplication for in-flight requests
        const result = await this.deduplicator.dedupe(cacheKey, async () => {
            return this.executeWithRetry(url, init, options);
        });

        // 3. Cache successful GET responses
        if (isCacheable && result.response.ok) {
            this.cache.set(cacheKey, result.response, result.data);
        }

        return result.response.clone();
    }

    /**
     * Fetch and return parsed JSON data directly
     */
    async fetchJson<T = any>(url: string, init?: RequestInit, options?: FetchOptions): Promise<T> {
        const cacheKey = options?.cacheKey || url;
        const isCacheable = options?.cacheable !== false && (!init?.method || init.method === 'GET');

        // 1. Check cache first
        if (isCacheable) {
            const cached = this.cache.get(cacheKey);
            if (cached) {
                this.logger?.onCacheHit?.(url);
                return cached.data as T;
            }
        }

        // 2. Use deduplication for in-flight requests
        const result = await this.deduplicator.dedupe(cacheKey, async () => {
            return this.executeWithRetry(url, init, options);
        });

        // 3. Cache successful GET responses
        if (isCacheable && result.response.ok) {
            this.cache.set(cacheKey, result.response, result.data);
        }

        return result.data as T;
    }

    private async executeWithRetry(
        url: string,
        init?: RequestInit,
        options?: FetchOptions
    ): Promise<{ response: Response; data: any }> {
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
            try {
                this.logger?.onRequest?.(url, attempt);
                const startTime = Date.now();

                // Wait for rate limit token
                await this.tokenBucket.acquire();

                // Execute through queue (unless skipped)
                const response = options?.skipQueue
                    ? await this.doFetch(url, init, options?.timeout)
                    : await this.requestQueue.enqueue(() => this.doFetch(url, init, options?.timeout));

                // Handle rate limit response
                if (response.status === 429 || response.status === 503) {
                    const retryAfter = this.parseRetryAfter(response);
                    this.logger?.onRateLimited?.(retryAfter);

                    // Update store for UI
                    rateLimitStore.setRateLimited(true, retryAfter);

                    if (attempt < this.config.maxRetries) {
                        const waitMs = this.calculateBackoff(attempt, retryAfter);
                        this.logger?.onRetry?.(url, attempt + 1, waitMs);
                        await this.sleep(waitMs);
                        continue;
                    }
                }

                // Success
                if (response.ok) {
                    const duration = Date.now() - startTime;
                    this.logger?.onSuccess?.(url, duration);
                    rateLimitStore.setRateLimited(false);

                    // Clone response before reading body
                    const clonedResponse = response.clone();
                    const data = await response.json().catch(() => null);

                    return { response: clonedResponse, data };
                }

                // Other error - parse and throw
                const clonedResponse = response.clone();
                const errorData = await response.json().catch(() => ({ error: response.statusText }));
                const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}`;

                const error = new Error(`API error (${response.status}): ${errorMessage}`);
                (error as any).status = response.status;
                (error as any).data = errorData;
                throw error;

            } catch (error) {
                lastError = error as Error;

                // Don't retry on queue overflow or non-retryable errors
                if ((error as any).isQueueOverflow) {
                    throw error;
                }

                // Retry on network errors
                if (attempt < this.config.maxRetries && this.isRetryable(error as Error)) {
                    const waitMs = this.calculateBackoff(attempt);
                    this.logger?.onRetry?.(url, attempt + 1, waitMs);
                    await this.sleep(waitMs);
                    continue;
                }

                this.logger?.onFailure?.(url, error as Error);
                throw error;
            }
        }

        this.logger?.onFailure?.(url, lastError!);
        throw lastError;
    }

    private async doFetch(url: string, init?: RequestInit, timeout?: number): Promise<Response> {
        if (timeout) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            try {
                return await fetch(url, {
                    ...init,
                    signal: controller.signal
                });
            } finally {
                clearTimeout(timeoutId);
            }
        }

        return fetch(url, init);
    }

    private parseRetryAfter(response: Response): number {
        const retryAfter = response.headers.get('Retry-After');

        if (retryAfter) {
            // Check if it's a number (seconds)
            const seconds = parseInt(retryAfter, 10);
            if (!isNaN(seconds)) {
                return seconds * 1000;
            }

            // Check if it's a date
            const date = new Date(retryAfter);
            if (!isNaN(date.getTime())) {
                return Math.max(0, date.getTime() - Date.now());
            }
        }

        return 0;
    }

    private calculateBackoff(attempt: number, retryAfterMs?: number): number {
        // Use Retry-After if provided and valid
        if (retryAfterMs && retryAfterMs > 0) {
            return Math.min(retryAfterMs, this.config.maxBackoffMs);
        }

        // Exponential backoff with jitter
        const exponentialMs = this.config.initialBackoffMs * Math.pow(this.config.backoffMultiplier, attempt);
        const jitter = Math.random() * this.config.jitterMaxMs;

        return Math.min(exponentialMs + jitter, this.config.maxBackoffMs);
    }

    private isRetryable(error: Error): boolean {
        // Network errors are retryable
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return true;
        }

        // Timeout errors
        if (error.name === 'AbortError') {
            return true;
        }

        // 5xx errors (if status is available)
        const status = (error as any).status;
        if (status && status >= 500) {
            return true;
        }

        return false;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Public utilities
    getQueueStatus(): { pending: number; active: number } {
        return {
            pending: this.requestQueue.getPendingCount(),
            active: this.requestQueue.getActiveCount()
        };
    }

    getAvailableTokens(): number {
        return this.tokenBucket.getAvailableTokens();
    }

    clearCache(): void {
        this.cache.clear();
    }
}

// ============= SINGLETON INSTANCE =============

// Default logger for development
const defaultLogger: FetchLogger = {
    onRequest: (url, attempt) => {
        if (attempt > 0) {
            console.log(`[FetchWrapper] Retry ${attempt} for ${url}`);
        }
    },
    onCacheHit: (url) => {
        console.log(`[FetchWrapper] Cache hit: ${url}`);
    },
    onRateLimited: (retryAfter) => {
        console.warn(`[FetchWrapper] Rate limited, retry after ${retryAfter}ms`);
    },
    onRetry: (url, attempt, waitMs) => {
        console.log(`[FetchWrapper] Retrying ${url} (attempt ${attempt}) in ${waitMs}ms`);
    },
    onSuccess: (url, durationMs) => {
        console.log(`[FetchWrapper] Success: ${url} (${durationMs}ms)`);
    },
    onFailure: (url, error) => {
        console.error(`[FetchWrapper] Failed: ${url}`, error.message);
    }
};

// Create singleton instance
let fetchWrapperInstance: FetchWrapper | null = null;

export function getFetchWrapper(config?: Partial<RateLimitConfig>, logger?: FetchLogger): FetchWrapper {
    if (!fetchWrapperInstance) {
        // Use default logger in development
        const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
        fetchWrapperInstance = new FetchWrapper(config, isDev ? (logger || defaultLogger) : logger);
    }
    return fetchWrapperInstance;
}

/**
 * Main fetch function with rate limiting
 */
export async function fetchWithRateLimit(
    url: string,
    init?: RequestInit,
    options?: FetchOptions
): Promise<Response> {
    return getFetchWrapper().fetch(url, init, options);
}

/**
 * Fetch JSON with rate limiting
 */
export async function fetchJsonWithRateLimit<T = any>(
    url: string,
    init?: RequestInit,
    options?: FetchOptions
): Promise<T> {
    return getFetchWrapper().fetchJson<T>(url, init, options);
}

// ============= DEBOUNCE UTILITY =============

export function debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return function (this: any, ...args: Parameters<T>) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            fn.apply(this, args);
            timeoutId = null;
        }, delay);
    };
}

/**
 * Debounce that returns a promise
 */
export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let pendingPromise: { resolve: (value: any) => void; reject: (error: any) => void } | null = null;

    return function (this: any, ...args: Parameters<T>): Promise<ReturnType<T>> {
        return new Promise((resolve, reject) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
                // Reject previous pending promise
                if (pendingPromise) {
                    pendingPromise.reject(new Error('Debounced'));
                }
            }

            pendingPromise = { resolve, reject };

            timeoutId = setTimeout(async () => {
                try {
                    const result = await fn.apply(this, args);
                    resolve(result);
                } catch (error) {
                    reject(error);
                } finally {
                    timeoutId = null;
                    pendingPromise = null;
                }
            }, delay);
        });
    };
}

// ============= THROTTLE UTILITY =============

export function throttle<T extends (...args: any[]) => any>(
    fn: T,
    limit: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
    let inThrottle = false;
    let lastResult: ReturnType<T> | undefined;

    return function (this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
        if (!inThrottle) {
            lastResult = fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
        return lastResult;
    };
}
