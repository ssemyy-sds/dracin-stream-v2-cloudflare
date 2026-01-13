/**
 * Dramabos API Adapter (API 3 - Backup 1)
 * Base URL: https://dramabos.asia/api/dramabox
 * Uses path-based endpoints with different structure
 */

import { BaseAdapter, type PaginatedResponse } from './adapter.interface';
import type { Drama, Episode, QualityOption } from '$lib/types';
import { normalizeDrama, normalizeEpisode } from '$lib/services/normalizers';
import { fixUrl } from '$lib/utils/helpers';

export class DramabosAdapter extends BaseAdapter {
    readonly providerId = 'api_backup1';
    readonly providerName = 'Backup API 1 (Dramabos)';

    constructor(baseUrl: string, headers?: Record<string, string>) {
        super(baseUrl, headers);
    }

    private extractList(data: any): any[] {
        if (!data) return [];
        if (data.data?.list) return data.data.list;
        if (data.list) return data.list;
        if (Array.isArray(data.data)) return data.data;
        if (Array.isArray(data)) return data;
        return [];
    }

    async getHome(page = 1, size = 20): Promise<PaginatedResponse<Drama>> {
        const url = `${this.baseUrl}/foryou/${page}`;
        const data = await this.fetchJson<any>(url);

        const list = this.extractList(data);
        const items = list.map(item => normalizeDrama(item, this.providerId));

        return {
            items,
            pagination: {
                page,
                size,
                hasMore: data.data?.isMore ?? items.length === size,
                total: data.data?.total
            }
        };
    }

    async search(keyword: string, page = 1): Promise<PaginatedResponse<Drama>> {
        // Note: Search is currently returning 503
        const url = `${this.baseUrl}/search/${encodeURIComponent(keyword)}/${page}`;

        try {
            const data = await this.fetchJson<any>(url);
            const list = this.extractList(data);
            const items = list.map(item => normalizeDrama(item, this.providerId));

            return {
                items,
                pagination: { page, size: 20, hasMore: items.length === 20 }
            };
        } catch (error) {
            console.warn('[Dramabos] Search unavailable, returning empty results');
            return {
                items: [],
                pagination: { page, size: 20, hasMore: false }
            };
        }
    }

    async getDetail(bookId: string): Promise<Drama> {
        const url = `${this.baseUrl}/drama/${bookId}`;

        try {
            const data = await this.fetchJson<any>(url);
            const dramaData = data.data || data;
            return normalizeDrama(dramaData, this.providerId);
        } catch (error) {
            // Fallback: try to get from foryou list
            console.warn('[Dramabos] Detail endpoint failed, trying foryou fallback');
            const home = await this.getHome(1, 50);
            const found = home.items.find(d => d.bookId === bookId);
            if (found) return found;
            throw new Error(`Drama not found: ${bookId}`);
        }
    }

    async getEpisodes(bookId: string): Promise<Episode[]> {
        const url = `${this.baseUrl}/chapters/${bookId}`;

        try {
            const data = await this.fetchJson<any>(url);
            const list = this.extractList(data);
            return list.map(ep => normalizeEpisode(ep, this.providerId));
        } catch (error) {
            console.warn('[Dramabos] Chapters endpoint failed');
            return [];
        }
    }

    async getStream(bookId: string, chapterId: string): Promise<QualityOption[]> {
        // Dramabos uses /watch/player with query params
        const url = `${this.baseUrl}/watch/player?bookId=${bookId}&chapterId=${chapterId}`;

        try {
            const data = await this.fetchJson<any>(url);
            const options: QualityOption[] = [];

            if (data.videoUrl || data.url) {
                options.push({
                    quality: data.quality || 720,
                    videoUrl: fixUrl(data.videoUrl || data.url),
                    isDefault: true
                });
            }

            if (data.qualities && Array.isArray(data.qualities)) {
                data.qualities.forEach((q: any) => {
                    options.push({
                        quality: q.quality || q.definition || 720,
                        videoUrl: fixUrl(q.url || q.videoUrl),
                        isDefault: false
                    });
                });
            }

            return options.sort((a, b) => b.quality - a.quality);
        } catch (error) {
            console.warn('[Dramabos] Stream endpoint failed');
            return [];
        }
    }

    async getTrending(page = 1): Promise<PaginatedResponse<Drama>> {
        const url = `${this.baseUrl}/rank/${page}`;
        const data = await this.fetchJson<any>(url);

        const list = this.extractList(data);
        const items = list.map(item => normalizeDrama(item, this.providerId));

        return {
            items,
            pagination: { page, size: 20, hasMore: items.length > 0 }
        };
    }

    async getVip(page = 1): Promise<PaginatedResponse<Drama>> {
        // Dramabos uses /new for VIP-like content
        const url = `${this.baseUrl}/new/${page}`;
        const data = await this.fetchJson<any>(url);

        const list = this.extractList(data);
        const items = list.map(item => normalizeDrama(item, this.providerId));

        return {
            items,
            pagination: { page, size: 20, hasMore: items.length > 0 }
        };
    }

    async getCategories(): Promise<Array<{ id: string; name: string }>> {
        const url = `${this.baseUrl}/classify`;
        const data = await this.fetchJson<any>(url);

        const list = this.extractList(data);
        return list.map((cat: any) => ({
            id: cat.id?.toString() || cat.bookId || '',
            name: cat.name || cat.bookName || ''
        }));
    }
}
