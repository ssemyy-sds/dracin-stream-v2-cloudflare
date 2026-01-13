/**
 * Gimita API Adapter (API 2 - Secondary)
 * Base URL: https://api.gimita.id/api/search/dramabox
 * Uses ?action=xxx query format
 */

import { BaseAdapter, type PaginatedResponse } from './adapter.interface';
import type { Drama, Episode, QualityOption } from '$lib/types';
import { normalizeDrama, normalizeEpisode } from '$lib/services/normalizers';
import { fixUrl } from '$lib/utils/helpers';

export class GimitaAdapter extends BaseAdapter {
    readonly providerId = 'api_secondary';
    readonly providerName = 'Secondary API (Gimita)';

    constructor(baseUrl: string, headers?: Record<string, string>) {
        super(baseUrl, headers);
    }

    async getHome(page = 1, size = 20): Promise<PaginatedResponse<Drama>> {
        const url = `${this.baseUrl}?action=home&page=${page}&size=${size}`;
        const data = await this.fetchJson<any>(url);

        const list = data.data || data || [];
        const items = Array.isArray(list)
            ? list.map(item => normalizeDrama(item, this.providerId))
            : [];

        return {
            items,
            pagination: {
                page,
                size,
                hasMore: items.length === size,
                total: data.total
            }
        };
    }

    async search(keyword: string, page = 1): Promise<PaginatedResponse<Drama>> {
        const url = `${this.baseUrl}?action=search&query=${encodeURIComponent(keyword)}&page=${page}`;
        const data = await this.fetchJson<any>(url);

        const list = data.data || data || [];
        const items = Array.isArray(list)
            ? list.map(item => normalizeDrama(item, this.providerId))
            : [];

        return {
            items,
            pagination: { page, size: 20, hasMore: items.length === 20 }
        };
    }

    async getDetail(bookId: string): Promise<Drama> {
        // Gimita's detail action only returns chapters, need to use search
        const url = `${this.baseUrl}?action=search&query=${bookId}`;
        const data = await this.fetchJson<any>(url);

        const list = data.data || data || [];
        if (Array.isArray(list) && list.length > 0) {
            return normalizeDrama(list[0], this.providerId);
        }

        throw new Error(`Drama not found: ${bookId}`);
    }

    async getEpisodes(bookId: string): Promise<Episode[]> {
        const url = `${this.baseUrl}?action=chapters&book_id=${bookId}`;
        const data = await this.fetchJson<any>(url);

        const list = data.data || data || [];
        return Array.isArray(list)
            ? list.map(ep => normalizeEpisode(ep, this.providerId))
            : [];
    }

    async getStream(bookId: string, chapterId: string): Promise<QualityOption[]> {
        const url = `${this.baseUrl}?action=stream&book_id=${bookId}&chapter_id=${chapterId}`;
        const data = await this.fetchJson<any>(url);

        const streamData = data.data || data;
        const options: QualityOption[] = [];

        // Handle CDN list structure
        if (streamData.cdnList && Array.isArray(streamData.cdnList)) {
            streamData.cdnList.forEach((cdn: any) => {
                if (cdn.videoPathList && Array.isArray(cdn.videoPathList)) {
                    cdn.videoPathList.forEach((path: any) => {
                        const videoUrl = path.videoPath || path.path || path.url;
                        if (videoUrl) {
                            let fullUrl = videoUrl;
                            if (cdn.cdnDomain && !videoUrl.startsWith('http')) {
                                fullUrl = `https://${cdn.cdnDomain}${videoUrl.startsWith('/') ? '' : '/'}${videoUrl}`;
                            }

                            options.push({
                                quality: path.quality || path.definition || 720,
                                videoUrl: fixUrl(fullUrl),
                                isDefault: false
                            });
                        }
                    });
                }
            });
        }

        // Direct URL fallback
        if (options.length === 0 && (streamData.videoUrl || streamData.url)) {
            options.push({
                quality: streamData.quality || 720,
                videoUrl: fixUrl(streamData.videoUrl || streamData.url),
                isDefault: true
            });
        }

        return options.sort((a, b) => b.quality - a.quality);
    }

    async getTrending(page = 1): Promise<PaginatedResponse<Drama>> {
        // Gimita uses 'home' for trending
        return this.getHome(page);
    }

    async getVip(page = 1): Promise<PaginatedResponse<Drama>> {
        const url = `${this.baseUrl}?action=vip&page=${page}`;
        const data = await this.fetchJson<any>(url);

        let items: Drama[] = [];
        const innerData = data.data || data;

        if (Array.isArray(innerData)) {
            items = innerData.map(item => normalizeDrama(item, this.providerId));
        } else if (innerData.bookList) {
            items = innerData.bookList.map((item: any) => normalizeDrama(item, this.providerId));
        } else if (innerData.columnVoList) {
            innerData.columnVoList.forEach((col: any) => {
                if (col.bookList) {
                    items.push(...col.bookList.map((item: any) => normalizeDrama(item, this.providerId)));
                }
            });
        }

        return {
            items,
            pagination: { page, size: 20, hasMore: items.length > 0 }
        };
    }
}
