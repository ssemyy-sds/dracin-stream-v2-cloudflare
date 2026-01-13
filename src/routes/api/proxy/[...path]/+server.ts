import type { RequestHandler } from '@sveltejs/kit';
import { API_CONFIGS, DEFAULT_API_ID, getAPIConfig } from '$lib/config/apis.config';

export const GET: RequestHandler = async ({ url, params, platform }) => {
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
    console.log(`[API Proxy] Using provider: ${apiConfig.name} (${apiConfig.id})`);

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
        console.log(`[API Proxy] Mapped action: ${actionPath} -> ${mappedAction}`);
    } else {
        // Path based (Primary, Backup1, Backup2)
        const bookId = queryParams.get('bookId');
        const chapterId = queryParams.get('chapterId');
        const keyword = queryParams.get('query') || queryParams.get('keyword');
        const page = queryParams.get('page') || '1';

        // Provider-specific endpoint mapping
        if (apiConfig.id === 'api_backup1') {
            // Dramabos endpoint mapping
            const dramabosMap: Record<string, string> = {
                'home': `/foryou/${page}`,
                'trending': `/rank/${page}`,
                'foryou': `/foryou/${page}`,
                'vip': `/new/${page}`,
                'search': keyword ? `/search/${encodeURIComponent(keyword)}/1` : '/search/drama/1',
                'detail': bookId ? `/drama/${bookId}` : '/drama',
                'allepisode': bookId ? `/chapters/${bookId}` : '/chapters',
                'stream': `/watch/player?bookId=${bookId}&chapterId=${chapterId}`,
                'categories': '/classify'
            };

            const mappedPath = dramabosMap[actionPath] || `/${actionPath}`;
            targetUrl = `${apiConfig.baseUrl}${mappedPath}`;
            console.log(`[API Proxy] Dramabos mapped: ${actionPath} -> ${mappedPath}`);

        } else if (apiConfig.id === 'api_backup2') {
            // Paxsenix endpoint mapping
            // User requested mapping detail, allepisode, stream to 'download' endpoint
            const paxsenixMap: Record<string, string> = {
                'home': '/api/home',
                'trending': '/api/recommend',
                'recommend': '/api/recommend',
                'foryou': '/api/home',
                'vip': '/api/vip',
                'search': '/api/search',
                'detail': '/api/download',
                'allepisode': '/api/download',
                'stream': '/api/download',
                'categories': '/api/categories'
            };

            const mappedPath = paxsenixMap[actionPath] || `/api/${actionPath}`;

            // Build query params for Paxsenix
            const paxParams = new URLSearchParams();
            if (keyword) paxParams.set('keyword', keyword); // Paxsenix uses 'keyword' not 'query'
            if (page && page !== '1') paxParams.set('page', page);

            // For download endpoint, pass bookId/chapterId as query params
            if (bookId) paxParams.set('bookId', bookId);
            if (chapterId) paxParams.set('chapterId', chapterId);

            const paxQuery = paxParams.toString();
            targetUrl = `${apiConfig.baseUrl}${mappedPath}${paxQuery ? '?' + paxQuery : ''}`;
            console.log(`[API Proxy] Paxsenix mapped: ${actionPath} -> ${mappedPath}`);

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

    console.log('[API Proxy] targetUrl:', targetUrl);

    try {
        const response = await fetch(targetUrl, {
            headers: apiConfig.headers || {}
        });

        // Log response details for debugging
        console.log(`[API Proxy] Upstream status: ${response.status} for ${path}`);

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
                    'Access-Control-Allow-Origin': '*',
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
                    'Access-Control-Allow-Origin': '*',
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
            'Access-Control-Allow-Origin': '*',
            'X-Active-Provider': apiConfig.id
        });

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
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
};
