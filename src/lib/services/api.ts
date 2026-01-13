import type {
    Drama,
    Episode,
    QualityOption,
    CategoryType
} from '$lib/types';
import { normalizeDrama, normalizeEpisode } from './normalizers';
import { fixUrl } from '$lib/utils/helpers';
import { activeProvider } from '$lib/stores/apiState';

// API base URL (through Cloudflare Worker proxy)
const API_BASE = '/api/proxy';

const DEBUG_MODE = true;

function debugLog(message: string, data: any = null) {
    if (DEBUG_MODE) {
        console.log(`[API Service Debug] ${message}`, data ? JSON.stringify(data).substring(0, 200) : '');
    }
}

/**
 * Validate API response structure
 */
function validateResponse(data: any, endpoint: string): { valid: boolean; error?: string } {
    if (data === null || data === undefined) {
        return { valid: false, error: 'Empty response' };
    }

    // Check for error indicators
    if (data.error) {
        return { valid: false, error: typeof data.error === 'string' ? data.error : JSON.stringify(data.error) };
    }

    if (data.success === false) {
        return { valid: false, error: data.message || 'API returned success: false' };
    }

    // Endpoint-specific validation
    const listEndpoints = ['home', 'trending', 'recommend', 'foryou', 'latest', 'search', 'vip', 'allepisode'];
    if (listEndpoints.includes(endpoint)) {
        // These should return arrays or objects with list data
        const hasData = Array.isArray(data) ||
            (data.data && Array.isArray(data.data)) ||
            (data.data && data.data.list && Array.isArray(data.data.list)) ||
            data.columnVoList ||
            data.bookList;
        if (!hasData && Object.keys(data).length === 0) {
            return { valid: false, error: `No data returned for ${endpoint}` };
        }
    }

    return { valid: true };
}

/**
 * Helper to extract list from various response structures
 */
function getList(data: any): any[] {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.data && data.data.list && Array.isArray(data.data.list)) return data.data.list;
    if (data.bookList && Array.isArray(data.bookList)) return data.bookList;
    return [];
}

/**
 * Internal fetch wrapper
 */
async function internalFetch(url: string, endpoint: string): Promise<{ data: any, providerId: string }> {
    const response = await fetch(url);
    const providerId = response.headers.get('X-Active-Provider') || 'unknown';

    // Update store
    activeProvider.set(providerId);

    debugLog(`Response Status: ${response.status} for ${endpoint} from ${providerId}`);

    if (!response.ok) {
        let errorDetail = `HTTP ${response.status}`;
        try {
            const errorData = await response.json();
            errorDetail = errorData.detail || errorData.error || errorDetail;
            console.error(`[API Service] Error for ${endpoint}:`, errorData);
        } catch {
            const errorText = await response.text().catch(() => 'No error text');
            errorDetail = errorText.substring(0, 200);
        }
        throw new Error(`API error (${response.status}): ${errorDetail}`);
    }

    const data = await response.json();

    // Validate response structure
    const validation = validateResponse(data, endpoint);
    if (!validation.valid) {
        console.warn(`[API Service] Validation warning for ${endpoint}: ${validation.error}`);
    }

    debugLog(`Success from ${providerId} for ${endpoint}`);
    return { data, providerId };
}

/**
 * Fetch data from Unified API Proxy
 * Returns raw data and the provider ID that served it
 */
async function fetchApi(endpoint: string, params: Record<string, string> = {}): Promise<{ data: any, providerId: string }> {
    // Construct query string
    const query = new URLSearchParams(params).toString();
    const url = `${API_BASE}/${endpoint}${query ? '?' + query : ''}`;

    debugLog(`Fetching: ${url}`, params);

    try {
        return await internalFetch(url, endpoint);
    } catch (error: any) {
        console.error(`[API Service] Fetch failed for ${endpoint}:`, error.message);


        throw error;
    }
}

// ============= PUBLIC API FUNCTIONS =============

/**
 * Get drama details by ID
 */
export async function getDramaDetail(bookId: string): Promise<Drama> {
    // Try detail endpoint first
    let { data, providerId } = await fetchApi('detail', { bookId });

    // For Secondary API, 'detail' only returns chapters. 
    // We need to fetch metadata from 'search' action using the ID.
    if (providerId === 'api_secondary') {
        const searchRes = await fetchApi('search', { query: bookId });
        const list = searchRes.data?.data || searchRes.data || [];
        if (Array.isArray(list) && list.length > 0) {
            // Found metadata in search
            return normalizeDrama(list[0], providerId);
        }
    }

    if (providerId === 'api_backup2') {
        // Hybrid fetch for Backup 2:
        // Metadata from Search (simulating Home detail)
        try {
            const searchRes = await fetchApi('search', { query: bookId });
            const list = getList(searchRes.data);

            if (Array.isArray(list) && list.length > 0) {
                return normalizeDrama(list[0], providerId);
            }
        } catch (e) {
            console.warn('[API] Backup2 search metadata failed');
        }

        // Fallback: If search fails, return a basic drama object
        return {
            id: bookId,
            title: `Drama ${bookId}`,
            poster: '',
            synopsis: 'Description not available',
            genres: [],
            status: 'Ongoing',
            totalEpisodes: 0,
            episodes: []
        };
    }

    // Handle secondary API wrapper: { data: {...}, success: true }
    const dramaData = data?.data || data;
    return normalizeDrama(dramaData, providerId);
}

/**
 * Get all episodes for a drama
 */
export async function getAllEpisodes(bookId: string): Promise<Array<Omit<Episode, 'videoUrl' | 'qualityOptions'>>> {
    const { data, providerId } = await fetchApi('allepisode', { bookId });

    // Handle secondary API wrapper: { data: [...], success: true }
    const episodeList = Array.isArray(data) ? data : (data?.data || []);

    if (!Array.isArray(episodeList)) {
        console.warn('[API] getAllEpisodes: No valid episode array found');
        return [];
    }

    return episodeList.map((ep: any, idx: number) => normalizeEpisode(ep, providerId));
}

/**
 * Get video stream URL for an episode
 * Handles both providers:
 * 1. Primary: Video info embedded in 'allepisode'
 * 2. Secondary: Needs separate 'stream' call using chapterId
 */
export async function getStreamUrl(bookId: string, episodeNum: number): Promise<QualityOption[]> {
    // 1. Fetch episode list first (unified approach)
    // We reuse getAllEpisodes logic but need raw data + provider to decide next step
    const { data, providerId } = await fetchApi('allepisode', { bookId });

    if (!Array.isArray(data) || data.length === 0) {
        return [];
    }

    const episodeIndex = Math.max(0, episodeNum - 1);
    const episodeData = data[episodeIndex] || data[0];

    // Normalize to see if we already have video
    const episode = normalizeEpisode(episodeData, providerId);

    if (episode.qualityOptions.length > 0) {
        return episode.qualityOptions;
    }

    // If no video, we likely need to fetch specific stream endpoint (Secondary API style)
    if (episode.chapterId) {
        try {
            const { data: streamData } = await fetchApi('stream', {
                bookId,
                chapterId: episode.chapterId
            });

            // Normalize stream data
            const options: QualityOption[] = [];

            // Secondary API stream structure handling
            // cdnList logic similar to normalizeEpisode but for stream response
            if (streamData.cdnList && Array.isArray(streamData.cdnList)) {
                streamData.cdnList.forEach((cdn: any) => {
                    if (cdn.videoPathList && Array.isArray(cdn.videoPathList)) {
                        cdn.videoPathList.forEach((path: any) => {
                            const url = path.videoPath || path.path || path.url;
                            if (url) {
                                let fullUrl = url;
                                if (cdn.cdnDomain && !url.startsWith('http')) {
                                    fullUrl = `https://${cdn.cdnDomain}${url.startsWith('/') ? '' : '/'}${url}`;
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

            // Create default option if direct url exists
            if (options.length === 0 && (streamData.videoUrl || streamData.url)) {
                options.push({
                    quality: streamData.quality || 720,
                    videoUrl: fixUrl(streamData.videoUrl || streamData.url),
                    isDefault: true
                });
            }

            return options.sort((a, b) => b.quality - a.quality);

        } catch (e) {
            console.error('Failed to fetch secondary stream:', e);
        }
    }

    return [];
}

/**
 * Get home content (Unified)
 * Maps to 'home' endpoint
 */
export async function getHome(page = 1, size = 20): Promise<Drama[]> {
    const { data, providerId } = await fetchApi('home', {
        page: page.toString(),
        size: size.toString()
    });

    const list = getList(data);
    return list.map((item: any) => normalizeDrama(item, providerId));
}

/**
 * Get recommendations (Unified)
 * Maps to 'recommend' endpoint (or fallback)
 */
export async function getRecommend(page = 1, size = 20): Promise<Drama[]> {
    try {
        const { data, providerId } = await fetchApi('recommend', {
            page: page.toString(),
            size: size.toString()
        });
        const list = getList(data);
        if (list.length > 0) return list.map((item: any) => normalizeDrama(item, providerId));
    } catch (e) {
        // Fallback
    }

    return getForYou();
}

/**
 * Get trending dramas
 */
export async function getTrending(): Promise<Drama[]> {
    const { data, providerId } = await fetchApi('trending');
    const list = getList(data);
    return list.map((item: any) => normalizeDrama(item, providerId));
}

/**
 * Get popular dramas
 */
export async function getPopular(): Promise<Drama[]> {
    const { data, providerId } = await fetchApi('populersearch');
    const list = getList(data);
    return list.map((item: any) => normalizeDrama(item, providerId));
}

/**
 * Get latest dramas
 */
export async function getLatest(): Promise<Drama[]> {
    const { data, providerId } = await fetchApi('latest');
    const list = getList(data);
    return list.map((item: any) => normalizeDrama(item, providerId));
}

/**
 * Get personalized recommendations
 * Secondary API doesn't support 'foryou', uses 'recommend' instead
 */
export async function getForYou(): Promise<Drama[]> {
    // Try 'recommend' first (supported by secondary), fallback to 'home'
    try {
        const { data, providerId } = await fetchApi('recommend', { page: '1', size: '20' });
        const list = getList(data);
        if (list.length > 0) {
            return list.map((item: any) => normalizeDrama(item, providerId));
        }
    } catch (e) {
        console.warn('[API] Recommend failed, falling back to home');
    }
    // Fallback to home
    return getHome(1, 20);
}

/**
 * Get VIP content with unified structure handling
 */
export async function getVip(page = 1): Promise<Drama[]> {
    const { data, providerId } = await fetchApi('vip', { page: page.toString() });

    // Handle different response structures based on provider
    let list: any[] = getList(data);

    // If getList returned empty, check for complex structures
    if (list.length === 0) {
        // Helper to find list in diverse structures
        if (data.columnVoList) {
            data.columnVoList.forEach((col: any) => {
                if (col.bookInfoList) list.push(...col.bookInfoList);
                if (col.bookList) list.push(...col.bookList);
            });
        }

        // Secondary wrapped style
        const innerData = data.data || data;
        if (innerData.bookList) {
            list = innerData.bookList;
        } else if (innerData.columnVoList) {
            innerData.columnVoList.forEach((col: any) => {
                if (col.bookList) list.push(...col.bookList);
            });
        }
    }

    return list.map((item: any) => normalizeDrama(item, providerId));
}

/**
 * Get Indonesian dubbed content
 */
export async function getDubIndo(classify = 'all', page = 1): Promise<Drama[]> {
    const { data, providerId } = await fetchApi('dubindo', { classify, page: page.toString() });
    const list = getList(data);
    return list.map((item: any) => normalizeDrama(item, providerId));
}

/**
 * Search dramas
 */
export async function searchDramas(query: string): Promise<Drama[]> {
    const { data, providerId } = await fetchApi('search', { query });
    const list = getList(data);
    return list.map((item: any) => normalizeDrama(item, providerId));
}

/**
 * Get dramas by category type
 */
export async function getDramasByCategory(type: CategoryType, page = 1): Promise<Drama[]> {
    switch (type) {
        case 'trending': return getTrending();
        case 'foryou': return getForYou();
        case 'latest': return getLatest();
        case 'vip': return getVip(page);
        case 'dubindo': return getDubIndo('all', page);
        case 'populersearch': return getPopular();
        default: return getTrending();
    }
}
