import type { RequestHandler } from '@sveltejs/kit';
import { API_CONFIGS, DEFAULT_API_ID, getAPIConfig } from '$lib/config/apis.config';

// CORS configuration - restrict to your domains
const ALLOWED_ORIGINS = [
    'https://dracin.pages.dev',
    'https://dracinku.pages.dev',
    'http://localhost:5173',
    'http://localhost:4173'
];

/**
 * Get CORS headers based on request origin
 */
function getCorsHeaders(origin: string | null): Record<string, string> {
    // Check if origin is allowed
    const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400' // 24 hours
    };
}

/**
 * Handle CORS preflight requests
 */
export const OPTIONS: RequestHandler = ({ request }) => {
    const origin = request.headers.get('Origin');
    return new Response(null, {
        status: 204,
        headers: getCorsHeaders(origin)
    });
};

export const GET: RequestHandler = async ({ url, params, platform, request }) => {
    // Matcher: Not Health
    // We are handling this in code because rename failed
    const path = params.path;

    // Explicitly exclude health endpoint from proxying
    // This allows /api/health to function even if caught by this route (though specific route should win)
    if (path === 'health') {
        return new Response(null, { status: 404 }); // Let SvelteKit find the specific route? 
        // No, if this is caught, we are the handler.
        // We should just return the health data here OR ensuring the file system structure is correct is better.
        // Let's try to return 404 to see if it cascades? Cloudflare Workers handling might not cascade.
    }

    let providerId = url.searchParams.get('provider');

    // If no provider specified in query, try to get from KV
    if (!providerId) {
        try {
            if (platform?.env?.API_CONFIG) {
                const config: any = await platform.env.API_CONFIG.get('config', 'json');
                if (config && config.activeApiId) {
                    providerId = config.activeApiId;
                }
            }
        } catch (e) {
            console.error('Failed to read from KV:', e);
        }
    }

    // Fallback if still no provider
    if (!providerId) {
        providerId = DEFAULT_API_ID;
    }

    const apiConfig = getAPIConfig(providerId) || getAPIConfig(DEFAULT_API_ID)!;

    // Build query string
    const queryParams = new URLSearchParams();
    url.searchParams.forEach((value, key) => {
        if (key !== 'provider') {
            queryParams.set(key, value);
        }
    });

    let targetUrl: string;
    let actionPath = path || '';

    if (apiConfig.queryFormat === 'action') {
        // Secondary API (Gimita) uses ?action=xxx format
        // Need to map action names and parameter names

        // Action name mapping for secondary API
        const actionMap: Record<string, string> = {
            'allepisode': 'chapters',  // Secondary uses 'chapters' not 'allepisode'
            'trending': 'home',         // Secondary uses 'home' for trending
            'foryou': 'recommend'       // Secondary uses 'recommend' for foryou
        };

        const mappedAction = actionMap[actionPath] || actionPath;
        queryParams.set('action', mappedAction);

        // Parameter name mapping for secondary API
        // bookId -> book_id for detail/chapters/stream endpoints
        if (queryParams.has('bookId')) {
            const bookIdValue = queryParams.get('bookId')!;
            queryParams.delete('bookId');
            queryParams.set('book_id', bookIdValue);
        }

        // chapterId -> chapter_id if present
        if (queryParams.has('chapterId')) {
            const chapterIdValue = queryParams.get('chapterId')!;
            queryParams.delete('chapterId');
            queryParams.set('chapter_id', chapterIdValue);
        }

        if (mappedAction === 'vip') {
            // User requested: https://api.gimita.id/api/search/dramabox?action=vip
            // Explicitly remove page/size for VIP if that matches the instruction
            queryParams.delete('page');
            queryParams.delete('size');
        }

        targetUrl = `${apiConfig.baseUrl}?${queryParams.toString()}`;
    } else {
        // Path based (Primary, Backup1, Backup2)
        const bookId = queryParams.get('bookId');
        const chapterId = queryParams.get('chapterId');
        // Sanitize and limit keyword length to prevent abuse
        const rawKeyword = queryParams.get('query') || queryParams.get('keyword');
        const keyword = rawKeyword ? rawKeyword.substring(0, 100).trim() : null;
        const page = queryParams.get('page') || '1';

        // Provider-specific endpoint mapping
        if (apiConfig.id === 'api_backup1') {
            // Dramabos endpoint mapping
            // Dynamic parameter mapping for Dramabos
            const pageNum = parseInt(queryParams.get('page') || '1');
            const sizeNum = parseInt(queryParams.get('size') || '18');
            const offset = (pageNum - 1) * sizeNum;
            const lang = queryParams.get('lang') || 'id';

            const dramabosMap: Record<string, string> = {
                'home': `/home?offset=${offset}&count=${sizeNum}&lang=${lang}`,
                'trending': `/home?offset=0&count=18&lang=${lang}`,
                'recommend': `/home?offset=0&count=18&lang=${lang}`,
                'foryou': `/home?offset=0&count=18&lang=${lang}`,
                'vip': `/home?offset=0&count=18&lang=${lang}`,
                'search': keyword ? `/search?q=${encodeURIComponent(keyword)}&lang=${lang}` : `/search?q=drama&lang=${lang}`,
                'detail': bookId ? `/detail/${bookId}?lang=${lang}` : '/detail',
                'allepisode': bookId ? `/detail/${bookId}?lang=${lang}` : '/detail',
                'stream': `/video/${chapterId}?lang=${lang}`,
                'categories': `/home?offset=0&count=18&lang=${lang}`
            };

            const mappedPath = dramabosMap[actionPath] || `/${actionPath}`;
            targetUrl = `${apiConfig.baseUrl}${mappedPath}`;

        } else if (apiConfig.id === 'api_backup2') {
            // Paxsenix endpoint mapping
            // User requested mapping detail to /download/{bookId}
            const paxsenixMap: Record<string, string> = {
                'home': '/api/home',
                'trending': '/api/recommend',
                'recommend': '/api/recommend',
                'foryou': '/api/home',
                'vip': '/api/vip',
                'search': '/api/search',
                'detail': '/download',
                'allepisode': '/download',
                'stream': '/download',
                'categories': '/api/categories'
            };

            let mappedPath = paxsenixMap[actionPath] || `/api/${actionPath}`;

            // Build query params for Paxsenix
            const paxParams = new URLSearchParams();
            if (keyword) paxParams.set('keyword', keyword); // Paxsenix uses 'keyword' not 'query'
            if (page && page !== '1') paxParams.set('page', page);

            // SPECIAL CASE: Path parameter for /download endpoints (detail, allepisode, stream)
            if (['detail', 'allepisode', 'stream'].includes(actionPath) && bookId) {
                mappedPath = `${mappedPath}/${bookId}`;
                // bookId is in path, no need for query param
            } else if (bookId) {
                paxParams.set('bookId', bookId);
            }

            if (chapterId) paxParams.set('chapterId', chapterId);

            const paxQuery = paxParams.toString();
            targetUrl = `${apiConfig.baseUrl}${mappedPath}${paxQuery ? '?' + paxQuery : ''}`;

        } else if (apiConfig.id === 'api_backup3') {
            // Hafiz API mapping
            const hafizMap: Record<string, string> = {
                'home': '/dramas/indo',
                'search': '/search',
                'detail': '/dramas',
                'allepisode': '/dramas',
                'stream': '/chapters/video'
            };

            let mappedPath = hafizMap[actionPath] || `/${actionPath}`;

            // Handle ID in path for detail/allepisode
            if (['detail', 'allepisode'].includes(actionPath) && bookId) {
                mappedPath = `${mappedPath}/${bookId}`;
            }

            const hParams = new URLSearchParams();
            if (keyword) hParams.set('keyword', keyword);
            if (page) hParams.set('page', page);
            if (queryParams.has('size')) hParams.set('size', queryParams.get('size')!);

            // Special handling for stream: book_id and episode
            if (actionPath === 'stream') {
                if (bookId) hParams.set('book_id', bookId);
                // Note: normalized episode number starts from 1
                const ep = queryParams.get('episode') || queryParams.get('chapterIndex') || '1';
                hParams.set('episode', ep);
            }

            const hQuery = hParams.toString();
            targetUrl = `${apiConfig.baseUrl}${mappedPath}${hQuery ? '?' + hQuery : ''}`;

        } else if (apiConfig.id === 'api_flickreels') {
            // FlickReels endpoint mapping
            const flickReelsMap: Record<string, string> = {
                'home': '/foryou',
                'latest': '/latest',
                'trending': '/hotrank',
                'search': '/search',
                'detail': '/detailAndAllEpisode',
                'allepisode': '/detailAndAllEpisode',
                'stream': '/detailAndAllEpisode'
            };

            const mappedPath = flickReelsMap[actionPath] || `/${actionPath}`;

            // Map parameters
            const flickParams = new URLSearchParams();
            if (keyword) flickParams.set('query', keyword);
            if (bookId) flickParams.set('id', bookId);

            // Page/Size handling if needed
            if (queryParams.has('page')) flickParams.set('page', queryParams.get('page')!);
            if (queryParams.has('size')) flickParams.set('size', queryParams.get('size')!);

            const finalQuery = flickParams.toString();
            targetUrl = `${apiConfig.baseUrl}${mappedPath}${finalQuery ? '?' + finalQuery : ''}`;
        } else {
            // Primary (Sansekai) - standard path mapping
            // Note: /home returns HTML on Sansekai, use /trending instead
            if (actionPath === 'home') {
                actionPath = 'trending';
            } else if (actionPath === 'recommend') {
                actionPath = 'randomdrama';
            } else if (actionPath === 'detail') {
                // User requested: https://api.sansekai.my.id/api/dramabox/allepisode?bookId=12345 for DETAIL
                actionPath = 'allepisode';
            }

            const queryString = queryParams.toString();
            targetUrl = `${apiConfig.baseUrl}/${actionPath}${queryString ? '?' + queryString : ''}`;
        }
    }



    try {
        const response = await fetch(targetUrl, {
            headers: apiConfig.headers || {}
        });

        // Handle non-OK responses with detailed error extraction
        if (!response.ok) {
            let errorDetail = 'Unknown upstream error';
            try {
                const errorBody = await response.text();
                errorDetail = errorBody.substring(0, 500); // Limit error length
                console.error(`[API Proxy] Upstream error (${response.status}):`, errorDetail);
            } catch (e) {
                console.error('[API Proxy] Failed to read upstream error body');
            }

            return new Response(JSON.stringify({
                error: 'Upstream API error',
                status: response.status,
                detail: errorDetail,
                provider: apiConfig.id,
                targetUrl
            }), {
                status: response.status,
                headers: {
                    'Content-Type': 'application/json',
                    ...getCorsHeaders(request.headers.get('Origin')),
                    'X-Active-Provider': apiConfig.id
                }
            });
        }

        const data = await response.json();

        // Validate response data structure
        if (data === null || data === undefined) {
            console.warn('[API Proxy] Empty response from upstream');
            return new Response(JSON.stringify({
                error: 'Empty response from API',
                provider: apiConfig.id
            }), {
                status: 502,
                headers: {
                    'Content-Type': 'application/json',
                    ...getCorsHeaders(request.headers.get('Origin')),
                    'X-Active-Provider': apiConfig.id
                }
            });
        }

        // Check for API-level error indicators
        if (data.error || data.code === 'error' || data.success === false) {
            console.warn('[API Proxy] API returned error:', data.error || data.message);
        }

        // Pass through CORS
        const responseHeaders = new Headers({
            'Content-Type': 'application/json',
            ...getCorsHeaders(request.headers.get('Origin')),
            'X-Active-Provider': apiConfig.id
        });

        // OPTIMIZATION: Filter payload if mode=list is requested
        // This reduces 13MB+ payloads to <100KB by removing video details
        const mode = url.searchParams.get('mode');
        if (mode === 'list' && (actionPath === 'allepisode' || actionPath === 'chapters' || actionPath === 'download')) {
            let list: any[] = [];

            // Standardize list extraction
            if (Array.isArray(data)) {
                list = data;
            } else if (data.data && Array.isArray(data.data)) {
                list = data.data;
            } else if (data.data && data.data.chapters && Array.isArray(data.data.chapters)) {
                list = data.data.chapters;
            } else if (data.chapters && Array.isArray(data.chapters)) {
                list = data.chapters;
            } else if (data.videos && Array.isArray(data.videos)) {
                list = data.videos;
            } else if (data.data && data.data.videos && Array.isArray(data.data.videos)) {
                list = data.data.videos;
            }

            if (list.length > 0) {
                // Map to lightweight structure
                const lightweightList = list.map((item: any) => ({
                    // Keep IDs and basic info
                    chapterId: item.chapterId || item.chapterid || item.vid || item.id,
                    chapterIndex: item.chapterIndex || item.episode || item.index,
                    chapterName: item.chapterName || item.episode || item.name || item.title,
                    cover: item.cover || item.coverUrl,

                    // Explicitly REMOVE heavy video fields
                    // We don't need to do anything as map creates new object, 
                    // but just to be clear what we are saving:
                    // - cdnList (HUGE)
                    // - videoPathList
                    // - videoPath
                }));

                // Replace data with lightweight version
                // Preserving envelope structure if it exists
                if (Array.isArray(data)) {
                    // If root was array, return array
                    return new Response(JSON.stringify(lightweightList), {
                        status: response.status,
                        headers: responseHeaders
                    });
                } else if (data.data && Array.isArray(data.data)) {
                    data.data = lightweightList;
                } else {
                    // Default fallback
                    data.data = lightweightList;
                }
            }
        }

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: responseHeaders
        });
    } catch (error: any) {
        console.error('[API Proxy] Fetch error:', error.message);
        return new Response(JSON.stringify({
            error: 'Proxy fetch failed',
            detail: error.message,
            provider: apiConfig?.id || 'unknown'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                ...getCorsHeaders(request.headers.get('Origin'))
            }
        });
    }
};
