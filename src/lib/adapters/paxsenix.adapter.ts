/**
 * Paxsenix API Adapter (API 4 - Backup 2)
 * Base URL: https://kdjekek-usieke-owjejxkek-iwjwjxkod.vercel.app
 * Path-based with wrapped responses
 */

import { BaseAdapter, type PaginatedResponse } from './adapter.interface';
import type { Drama, Episode, QualityOption } from '$lib/types';
import { normalizeDrama, normalizeEpisode } from '$lib/services/normalizers';
import { fixUrl } from '$lib/utils/helpers';

export class PaxsenixAdapter extends BaseAdapter {
    readonly providerId = 'api_backup2';
    readonly providerName = 'Backup API 2 (Paxsenix)';

    constructor(baseUrl: string, headers?: Record<string, string>) {
        super(baseUrl, headers);
    }

    private extractPagination(data: any): { page: number; size: number; hasMore: boolean; total?: number } {
        const info = data.info?.pagination || {};
        return {
            page: info.page || 1,
            size: info.size || 20,
            hasMore: info.hasMore ?? true,
            total: info.total
        };
    }

    async getHome(page = 1, size = 20): Promise<PaginatedResponse<Drama>> {
        const url = `${this.baseUrl}/api/home?page=${page}&size=${size}`;
        const data = await this.fetchJson<any>(url);

        const list = Array.isArray(data.data) ? data.data : [];
        const items = list.map((item: any) => normalizeDrama(item, this.providerId));

        return {
            items,
            pagination: this.extractPagination(data)
        };
    }

    async search(keyword: string, page = 1): Promise<PaginatedResponse<Drama>> {
        // Paxsenix uses 'keyword' param
        const url = `${this.baseUrl}/api/search?keyword=${encodeURIComponent(keyword)}&page=${page}`;
        const data = await this.fetchJson<any>(url);

        const list = Array.isArray(data.data) ? data.data : [];
        const items = list.map((item: any) => normalizeDrama(item, this.providerId));

        return {
            items,
            pagination: this.extractPagination(data)
        };
    }

    async getDetail(bookId: string): Promise<Drama> {
        // Paxsenix uses /api/detail/{bookId}/v2
        const url = `${this.baseUrl}/api/detail/${bookId}/v2`;
        const data = await this.fetchJson<any>(url);

        const dramaData = data.data || data;
        return normalizeDrama(dramaData, this.providerId);
    }

    async getEpisodes(bookId: string): Promise<Episode[]> {
        const url = `${this.baseUrl}/api/chapters/${bookId}`;
        const data = await this.fetchJson<any>(url);

        // Paxsenix returns { data: [...chapters], info: {...} }
        const list = Array.isArray(data.data) ? data.data :
            (data.data?.chapters || []);

        return list.map((ep: any) => normalizeEpisode(ep, this.providerId));
    }

    async getStream(bookId: string, chapterId: string): Promise<QualityOption[]> {
        const url = `${this.baseUrl}/api/stream?bookId=${bookId}&chapterId=${chapterId}`;
        const data = await this.fetchJson<any>(url);

        const streamData = data.data || data;
        const options: QualityOption[] = [];

        // Handle various stream response formats
        if (streamData.videoUrl || streamData.url) {
            options.push({
                quality: streamData.quality || 720,
                videoUrl: fixUrl(streamData.videoUrl || streamData.url),
                isDefault: true
            });
        }

        if (streamData.qualities && Array.isArray(streamData.qualities)) {
            streamData.qualities.forEach((q: any) => {
                if (!options.find(o => o.quality === q.quality)) {
                    options.push({
                        quality: q.quality || 720,
                        videoUrl: fixUrl(q.url || q.videoUrl),
                        isDefault: false
                    });
                }
            });
        }

        // CDN list format (if present)
        if (streamData.cdnList && Array.isArray(streamData.cdnList)) {
            streamData.cdnList.forEach((cdn: any) => {
                if (cdn.url) {
                    options.push({
                        quality: cdn.quality || 720,
                        videoUrl: fixUrl(cdn.url),
                        isDefault: false
                    });
                }
            });
        }

        return options.sort((a, b) => b.quality - a.quality);
    }

    async getTrending(page = 1): Promise<PaginatedResponse<Drama>> {
        const url = `${this.baseUrl}/api/recommend?page=${page}`;
        const data = await this.fetchJson<any>(url);

        const list = Array.isArray(data.data) ? data.data : [];
        const items = list.map((item: any) => normalizeDrama(item, this.providerId));

        return {
            items,
            pagination: this.extractPagination(data)
        };
    }

    async getVip(page = 1): Promise<PaginatedResponse<Drama>> {
        const url = `${this.baseUrl}/api/vip?page=${page}`;
        const data = await this.fetchJson<any>(url);

        const list = Array.isArray(data.data) ? data.data : [];
        const items = list.map((item: any) => normalizeDrama(item, this.providerId));

        return {
            items,
            pagination: this.extractPagination(data)
        };
    }

    async getCategories(): Promise<Array<{ id: string; name: string }>> {
        const url = `${this.baseUrl}/api/categories`;
        const data = await this.fetchJson<any>(url);

        const list = Array.isArray(data.data) ? data.data : [];
        return list.map((cat: any) => ({
            id: cat.id?.toString() || '',
            name: cat.name || cat.replaceName || ''
        }));
    }
}
