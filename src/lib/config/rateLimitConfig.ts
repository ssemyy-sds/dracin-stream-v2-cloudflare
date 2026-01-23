/**
 * Rate Limit Configuration
 * Centralized configuration for all rate limiting parameters
 */

export interface RateLimitConfig {
    // Rate limiting
    requestsPerMinute: number;
    maxConcurrentRequests: number;
    maxQueueSize: number;

    // Retry policy
    maxRetries: number;
    initialBackoffMs: number;
    maxBackoffMs: number;
    backoffMultiplier: number;
    jitterMaxMs: number;

    // Caching
    cacheTtlMs: number;

    // Debouncing
    debounceMs: number;
}

/**
 * Default configuration values
 * Can be overridden via environment variables or runtime config
 */
export const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
    // Rate limiting - Sansekai API allows 15 req/min
    requestsPerMinute: 15,
    maxConcurrentRequests: 2,
    maxQueueSize: 50,

    // Retry policy
    maxRetries: 3,
    initialBackoffMs: 500,
    maxBackoffMs: 30000,
    backoffMultiplier: 2,
    jitterMaxMs: 250,

    // Caching - 60 second TTL
    cacheTtlMs: 60000,

    // Debouncing for UI actions
    debounceMs: 300
};

/**
 * Get rate limit config with optional overrides
 */
export function getRateLimitConfig(overrides?: Partial<RateLimitConfig>): RateLimitConfig {
    return {
        ...DEFAULT_RATE_LIMIT_CONFIG,
        ...overrides
    };
}

/**
 * Localized error messages for rate limiting
 */
export const RATE_LIMIT_MESSAGES = {
    en: {
        rateLimited: "You've reached the API request limit. Please wait a moment and try again.",
        queueFull: "Too many pending requests. Please wait and try again.",
        retrying: "Request failed. Retrying...",
        countdown: "Retry available in {seconds}s"
    },
    id: {
        rateLimited: "Batas permintaan API tercapai. Silakan tunggu sebentar dan coba lagi.",
        queueFull: "Terlalu banyak permintaan tertunda. Silakan tunggu dan coba lagi.",
        retrying: "Permintaan gagal. Mencoba lagi...",
        countdown: "Coba lagi dalam {seconds} detik"
    }
};

export type SupportedLocale = keyof typeof RATE_LIMIT_MESSAGES;

/**
 * Get localized message
 */
export function getLocalizedMessage(
    key: keyof typeof RATE_LIMIT_MESSAGES.en,
    locale: SupportedLocale = 'id',
    params?: Record<string, string | number>
): string {
    let message = RATE_LIMIT_MESSAGES[locale]?.[key] || RATE_LIMIT_MESSAGES.en[key];

    if (params) {
        Object.entries(params).forEach(([k, v]) => {
            message = message.replace(`{${k}}`, String(v));
        });
    }

    return message;
}
