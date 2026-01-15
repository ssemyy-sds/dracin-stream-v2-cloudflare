import type { Drama, Episode, QualityOption } from '$lib/types';
import { parseRating, fixUrl } from '$lib/utils/helpers';

/**
 * Normalizes drama data from different API providers into a unified Drama interface
 */
export function normalizeDrama(data: any, providerId: string): Drama {
    // Default normalization (matches Primary API structure mostly)
    let viewCount = data.viewCount || data.playCount || 0;
    if (typeof viewCount === 'string') {
        const lower = viewCount.toLowerCase();
        const num = parseFloat(viewCount);
        if (!isNaN(num)) {
            if (lower.includes('k')) viewCount = num * 1000;
            else if (lower.includes('m')) viewCount = num * 1000000;
            else viewCount = num;
        } else {
            viewCount = 0;
        }
    }

    let drama: Drama = {
        bookId: data.bookId || data.bookid || data.id || '',
        bookName: data.bookName || data.bookname || data.name || '',
        // User requested fields
        id: data.bookId || data.bookid || data.id || '',
        name: data.bookName || data.bookname || data.name || '',
        tags: Array.isArray(data.tags) ? data.tags.map((t: any) => typeof t === 'string' ? t : (t.tagName || t.name || t)) : (data.genres || []),

        cover: fixUrl(data.cover || data.coverUrl || data.coverWap || ''),
        introduction: data.introduction || data.description || '',
        rating: typeof data.rating === 'number' ? data.rating : parseRating(data.score || data.rating || '0'),
        genres: Array.isArray(data.genres) ? data.genres.map((g: any) => typeof g === 'string' ? g : g.name) : (data.tags || []),
        status: (data.status === 'Completed' || data.finished) ? 'Completed' : 'Ongoing',
        year: data.year || data.releaseYear || new Date().getFullYear(),
        latestEpisode: data.latestEpisode || data.latestChapter || data.chapterCount || 0,
        chapterCount: data.chapterCount || data.totalChapter || 0,
        viewCount: viewCount,
        cornerLabel: data.cornerLabel || data.cornerName || data.status || ''
    };

    // Provider specific adjustments
    if (providerId === 'api_secondary') {
        // Gimita API specific fields handled by the generic fallbacks above
        // But if there are specific transformations needed:
        if (data.tags && Array.isArray(data.tags)) {
            // Secondary API tags might be objects { tagName: '...' }
            const tags = data.tags.map((t: any) => t.tagName || t.name || t).filter((t: any) => typeof t === 'string');
            if (tags.length > 0) drama.genres = tags;
        }
    } else if (providerId === 'api_backup1') {
        // Backup 1 (Dramabos)
        if (data.corner && data.corner.name) {
            drama.cornerLabel = data.corner.name;
        }
        // Dramabos uses 'episodes' for the count
        if (data.episodes) {
            drama.latestEpisode = data.episodes;
            drama.chapterCount = data.episodes;
        }
        // Dramabos uses different field names
        if ((data.introduction || data.intro) && !drama.introduction) {
            drama.introduction = data.introduction || data.intro;
        }
    } else if (providerId === 'api_backup2') {
        // Backup 2 (Paxsenix)
        // Uses 'id' instead of 'bookId', 'name' instead of 'bookName'
        if (data.id && !drama.bookId) {
            drama.bookId = data.id.toString();
        }
        if (data.name && !drama.bookName) {
            drama.bookName = data.name;
        }
        // Handle corner badge
        if (data.cornerName) {
            drama.cornerLabel = data.cornerName;
        } else if (data.corner && typeof data.corner === 'string') {
            drama.cornerLabel = data.corner;
        }
    }

    return drama;
}

/**
 * Normalizes episode data from different API providers
 */
export function normalizeEpisode(data: any, providerId: string): Episode {
    const ep: Episode = {
        chapterId: data.chapterId || data.chapterid || data.vid || data.id || '',
        chapterIndex: data.chapterIndex || data.episode || data.index || 0,
        chapterName: data.chapterName || data.name || data.title || `Episode ${data.chapterIndex || data.episode || 0}`,
        cover: fixUrl(data.cover || data.coverUrl || ''),
        videoUrl: '', // Populated usually by detailed stream call, or default
        videoPath: data.videoPath || '',
        qualityOptions: []
    };

    // If data already has video info
    // For api_backup2, user mentioned videoPath
    const vidUrl = data.videoUrl || data.url || data.videoPath;
    if (vidUrl) {
        ep.videoUrl = fixUrl(vidUrl);
        ep.qualityOptions.push({
            quality: 720, // Default assumption
            videoUrl: ep.videoUrl,
            isDefault: true
        });
    }

    // Handle CDN lists from Secondary API
    if (providerId === 'api_secondary' && data.cdnList) {
        // Logic to extract videoUrl from cdnList
        // This matches logic from previous api-secondary.ts
        if (Array.isArray(data.cdnList)) {
            data.cdnList.forEach((cdn: any) => {
                if (cdn.videoPathList && Array.isArray(cdn.videoPathList)) {
                    cdn.videoPathList.forEach((path: any) => {
                        const url = path.videoPath || path.path || path.url;
                        if (url) {
                            const quality = path.quality || path.definition || 720;
                            ep.qualityOptions.push({
                                quality,
                                videoUrl: url,
                                isDefault: false
                            });
                        }
                    });
                }
            });
            // Pick best quality as default
            if (ep.qualityOptions.length > 0) {
                ep.qualityOptions.sort((a, b) => b.quality - a.quality);
                ep.videoUrl = ep.qualityOptions[0].videoUrl;
                ep.qualityOptions[0].isDefault = true;
            }
        }
    }

    return ep;
}
