/**
 * API Configuration for Dracin Stream V2
 * Supports 4 different 3rd-party APIs with health monitoring
 */

export interface APIConfig {
    id: string;
    name: string;
    baseUrl: string;
    priority: number; // 1 = highest priority
    endpoints: {
        home: string;
        search: string;
        detail: string;
        episodes: string;
        stream: string;
        trending?: string;
        vip?: string;
        categories?: string;
        category?: string;
    };
    queryFormat: 'path' | 'action'; // path-based or action query param
    headers?: Record<string, string>;
    rateLimit?: {
        requests: number;
        period: number; // in seconds
    };
    healthCheck: {
        endpoint: string;
        expectedStatus: number;
        timeout: number; // in ms
    };
}

export const API_CONFIGS: APIConfig[] = [
    // API 1 - Primary (api.sansekai.my.id) - Currently blocked by Cloudflare
    {
        id: 'api_primary',
        name: 'Primary API (Sansekai)',
        baseUrl: 'https://api.sansekai.my.id/api/dramabox',
        priority: 1,
        queryFormat: 'path',
        endpoints: {
            home: '/home',
            search: '/search',
            detail: '/detail',
            episodes: '/allepisode',
            stream: '/allepisode',
            trending: '/trending',
            vip: '/vip'
        },
        headers: {
            'User-Agent': 'Dracin-Stream/2.0',
            'Accept': 'application/json'
        },
        rateLimit: {
            requests: 100,
            period: 60
        },
        healthCheck: {
            endpoint: '/trending',
            expectedStatus: 200,
            timeout: 5000
        }
    },

    // API 2 - Secondary (api.gimita.id) - Currently working
    {
        id: 'api_secondary',
        name: 'Secondary API (Gimita)',
        baseUrl: 'https://api.gimita.id/api/search/dramabox',
        priority: 4,
        queryFormat: 'action',
        endpoints: {
            home: 'home',
            search: 'search',
            detail: 'detail',
            episodes: 'allepisode',
            stream: 'stream',
            trending: 'home',
            vip: 'vip'
        },
        headers: {
            'User-Agent': 'Dracin-Stream/2.0',
            'Accept': 'application/json'
        },
        rateLimit: {
            requests: 80,
            period: 60
        },
        healthCheck: {
            endpoint: '?action=home&page=1&size=1',
            expectedStatus: 200,
            timeout: 5000
        }
    },

    // API 3 - Backup 1 (Dramabos)
    {
        id: 'api_backup1',
        name: 'Backup API 1 (Dramabos)',
        baseUrl: 'https://dramabos.asia/api/melolo/api/v1',
        priority: 3,
        queryFormat: 'path',
        endpoints: {
            home: '/home', // ?offset=0&count=18&lang=id
            search: '/search', // ?q={query}
            detail: '/detail', // /{bookId}?lang=id
            episodes: '/detail', // /{bookId}?lang=id (Same as detail, as it likely contains chapters)
            stream: '/video', // /{chapterId}?lang=id
            trending: '/home', // fallback to home
            vip: '/home', // fallback to home
            categories: '/home' // fallback to home
        },
        headers: {
            'User-Agent': 'Dracin-Stream/2.0',
            'Accept': 'application/json'
        },
        rateLimit: {
            requests: 60,
            period: 60
        },
        healthCheck: {
            endpoint: '/home',
            expectedStatus: 200,
            timeout: 5000
        }
    },

    // API 4 - Backup 2 (Paxsenix Vercel)
    {
        id: 'api_backup2',
        name: 'Backup API 2 (Paxsenix)',
        baseUrl: 'https://kdjekek-usieke-owjejxkek-iwjwjxkod.vercel.app',
        priority: 1,
        queryFormat: 'path',
        endpoints: {
            home: '/api/home',
            search: '/api/search', // uses ?keyword= param
            detail: '/api/detail', // /{bookId}/v2
            episodes: '/api/chapters', // /{bookId}
            stream: '/api/stream',
            trending: '/api/recommend',
            vip: '/api/vip',
            categories: '/api/categories',
            category: '/api/category' // /{id}
        },
        headers: {
            'Accept': 'application/json',
            'User-Agent': 'Dracin-Stream/2.0'
        },
        rateLimit: {
            requests: 100,
            period: 60
        },
        healthCheck: {
            endpoint: '/api/home',
            expectedStatus: 200,
            timeout: 5000
        }
    },

    // API 5 - FlickReels (api.sansekai.my.id/api/flickreels)
    {
        id: 'api_flickreels',
        name: 'FlickReels API',
        baseUrl: 'https://api.sansekai.my.id/api/flickreels',
        priority: 2,
        queryFormat: 'path',
        endpoints: {
            home: '/foryou',
            search: '/search',
            detail: '/detailAndAllEpisode',
            episodes: '/detailAndAllEpisode',
            stream: '/detailAndAllEpisode', // FlickReels combines these
            trending: '/hotrank'
        },
        headers: {
            'User-Agent': 'Dracin-Stream/2.0',
            'Accept': 'application/json'
        },
        healthCheck: {
            endpoint: '/foryou',
            expectedStatus: 200,
            timeout: 5000
        }
    },

    // API 6 - Backup 3 (Hafiz Hibnusyam)
    {
        id: 'api_backup3',
        name: 'Backup API 3 (Hafiz)',
        baseUrl: 'https://db.hafizhibnusyam.my.id/api',
        priority: 1,
        queryFormat: 'path',
        endpoints: {
            home: '/dramas/indo',
            search: '/search',
            detail: '/dramas',
            episodes: '/dramas',
            stream: '/chapters/video'
        },
        headers: {
            'User-Agent': 'Dracin-Stream/2.0',
            'Accept': 'application/json'
        },
        healthCheck: {
            endpoint: '/dramas/indo?page=1',
            expectedStatus: 200,
            timeout: 5000
        }
    }
];

// Default to backup2 since others are down
export const DEFAULT_API_ID = 'api_backup3';

// Helper function to get API config by ID
export function getAPIConfig(apiId: string): APIConfig | undefined {
    return API_CONFIGS.find(api => api.id === apiId);
}

// Helper function to get active API config from KV or default
export function getDefaultAPIConfig(): APIConfig {
    return API_CONFIGS.find(api => api.id === DEFAULT_API_ID) || API_CONFIGS[0];
}
