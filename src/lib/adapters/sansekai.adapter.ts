/**
 * Sansekai API Adapter (API 1 - Primary)
 * Base URL: https://api.sansekai.my.id/api/dramabox
 */

import { BaseAdapter, type PaginatedResponse } from './adapter.interface';
import type { Drama, Episode, QualityOption } from '$lib/types';
import { normalizeDrama, normalizeEpisode } from '$lib/services/normalizers';
import { fixUrl } from '$lib/utils/helpers';

export class SansekaiAdapter extends BaseAdapter {
    readonly providerId = 'api_primary';
    readonly providerName = 'Primary API (Sansekai)';

    constructor(baseUrl: string, headers?: Record<string, string>) {
        super(baseUrl, headers);
    }

    async getHome(page = 1, size = 20): Promise<PaginatedResponse<Drama>> {
        // Note: /home returns HTML, use /trending instead
        const url = `${this.baseUrl}/trending`;
        const data = await this.fetchJson<any[]>(url);

        const items = Array.isArray(data)
            ? data.map(item => normalizeDrama(item, this.providerId))
            : [];

        return {
            items: items.slice((page - 1) * size, page * size),
            pagination: {
                page,
                size,
                hasMore: items.length > page * size,
                total: items.length
            }
        };
    }

    async search(keyword: string, page = 1): Promise<PaginatedResponse<Drama>> {
        const url = `${this.baseUrl}/search?query=${encodeURIComponent(keyword)}&page=${page}`;
        const data = await this.fetchJson<any[]>(url);

        const items = Array.isArray(data)
            ? data.map(item => normalizeDrama(item, this.providerId))
            : [];

        return {
            items,
            pagination: { page, size: 20, hasMore: items.length === 20 }
        };
    }

    async getDetail(bookId: string): Promise<Drama> {
        const url = `${this.baseUrl}/detail?bookId=${bookId}`;
        const data = await this.fetchJson<any>(url);
        return normalizeDrama(data, this.providerId);
    }

    async getEpisodes(bookId: string): Promise<Episode[]> {
        const url = `${this.baseUrl}/allepisode?bookId=${bookId}`;
        const data = await this.fetchJson<any[]>(url);

        return Array.isArray(data)
            ? data.map(ep => normalizeEpisode(ep, this.providerId))
            : [];
    }

    async getStream(bookId: string, chapterId: string): Promise<QualityOption[]> {
        // Sansekai embeds video URLs directly in allepisode response
        const episodes = await this.getEpisodes(bookId);
        const episode = episodes.find(ep => ep.chapterId === chapterId);

        if (episode && episode.qualityOptions.length > 0) {
            return episode.qualityOptions;
        }

        // Fallback: return empty if no stream found
        return [];
    }

    async getTrending(page = 1): Promise<PaginatedResponse<Drama>> {
        return this.getHome(page);
    }

    async getVip(page = 1): Promise<PaginatedResponse<Drama>> {
        const url = `${this.baseUrl}/vip?page=${page}`;
        const data = await this.fetchJson<any>(url);

        // VIP response might have columnVoList structure
        let items: Drama[] = [];

        if (Array.isArray(data)) {
            items = data.map(item => normalizeDrama(item, this.providerId));
        } else if (data.columnVoList) {
            data.columnVoList.forEach((col: any) => {
                if (col.bookInfoList || col.bookList) {
                    const list = col.bookInfoList || col.bookList;
                    items.push(...list.map((item: any) => normalizeDrama(item, this.providerId)));
                }
            });
        }

        return {
            items,
            pagination: { page, size: 20, hasMore: items.length === 20 }
        };
    }
}
