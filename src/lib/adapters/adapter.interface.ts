/**
 * Unified API Adapter Interface
 * All API providers must implement this interface
 */

import type { Drama, Episode, QualityOption } from '$lib/types';

/**
 * Pagination info returned by APIs
 */
export interface PaginationInfo {
    page: number;
    size: number;
    hasMore: boolean;
    total?: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
    items: T[];
    pagination: PaginationInfo;
}

/**
 * API Adapter Interface
 * Defines the contract for all API provider adapters
 */
export interface APIAdapter {
    /** Provider ID matching apis.config.ts */
    readonly providerId: string;

    /** Provider display name */
    readonly providerName: string;

    /**
     * Get home/featured content
     */
    getHome(page?: number, size?: number): Promise<PaginatedResponse<Drama>>;

    /**
     * Search dramas by keyword
     */
    search(keyword: string, page?: number): Promise<PaginatedResponse<Drama>>;

    /**
     * Get drama details by ID
     */
    getDetail(bookId: string): Promise<Drama>;

    /**
     * Get all episodes for a drama
     */
    getEpisodes(bookId: string): Promise<Episode[]>;

    /**
     * Get video stream URL for an episode
     */
    getStream(bookId: string, chapterId: string): Promise<QualityOption[]>;

    /**
     * Get trending/ranking content
     */
    getTrending(page?: number): Promise<PaginatedResponse<Drama>>;

    /**
     * Get VIP/premium content
     */
    getVip(page?: number): Promise<PaginatedResponse<Drama>>;

    /**
     * Get categories/genres list
     */
    getCategories?(): Promise<Array<{ id: string; name: string }>>;

    /**
     * Health check - verify API is reachable
     */
    healthCheck(): Promise<boolean>;
}

/**
 * Base class with common utilities for adapters
 */
export abstract class BaseAdapter implements APIAdapter {
    abstract readonly providerId: string;
    abstract readonly providerName: string;

    protected baseUrl: string;
    protected headers: Record<string, string>;

    constructor(baseUrl: string, headers: Record<string, string> = {}) {
        this.baseUrl = baseUrl;
        this.headers = {
            'Accept': 'application/json',
            'User-Agent': 'Dracin-Stream/2.0',
            ...headers
        };
    }

    protected async fetchJson<T>(url: string): Promise<T> {
        const response = await fetch(url, { headers: this.headers });

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    abstract getHome(page?: number, size?: number): Promise<PaginatedResponse<Drama>>;
    abstract search(keyword: string, page?: number): Promise<PaginatedResponse<Drama>>;
    abstract getDetail(bookId: string): Promise<Drama>;
    abstract getEpisodes(bookId: string): Promise<Episode[]>;
    abstract getStream(bookId: string, chapterId: string): Promise<QualityOption[]>;
    abstract getTrending(page?: number): Promise<PaginatedResponse<Drama>>;
    abstract getVip(page?: number): Promise<PaginatedResponse<Drama>>;

    async healthCheck(): Promise<boolean> {
        try {
            await this.getHome(1, 1);
            return true;
        } catch {
            return false;
        }
    }
}
