const API_CONFIGS = [
  // API 1 - Primary (api.sansekai.my.id) - Currently blocked by Cloudflare
  {
    id: "api_primary",
    name: "Primary API (Sansekai)",
    baseUrl: "https://api.sansekai.my.id/api/dramabox",
    priority: 1,
    queryFormat: "path",
    endpoints: {
      home: "/home",
      search: "/search",
      detail: "/detail",
      episodes: "/allepisode",
      stream: "/allepisode",
      trending: "/trending",
      vip: "/vip"
    },
    headers: {
      "User-Agent": "Dracin-Stream/2.0",
      "Accept": "application/json"
    },
    rateLimit: {
      requests: 100,
      period: 60
    },
    healthCheck: {
      endpoint: "/trending",
      expectedStatus: 200,
      timeout: 5e3
    }
  },
  // API 2 - Secondary (api.gimita.id) - Currently working
  {
    id: "api_secondary",
    name: "Secondary API (Gimita)",
    baseUrl: "https://api.gimita.id/api/search/dramabox",
    priority: 2,
    queryFormat: "action",
    endpoints: {
      home: "home",
      search: "search",
      detail: "detail",
      episodes: "allepisode",
      stream: "stream",
      trending: "home",
      vip: "vip"
    },
    headers: {
      "User-Agent": "Dracin-Stream/2.0",
      "Accept": "application/json"
    },
    rateLimit: {
      requests: 80,
      period: 60
    },
    healthCheck: {
      endpoint: "?action=home&page=1&size=1",
      expectedStatus: 200,
      timeout: 5e3
    }
  },
  // API 3 - Backup 1 (Dramabos)
  {
    id: "api_backup1",
    name: "Backup API 1 (Dramabos)",
    baseUrl: "https://dramabos.asia/api/dramabox",
    priority: 3,
    queryFormat: "path",
    endpoints: {
      home: "/foryou/1",
      search: "/search",
      // Currently 503
      detail: "/drama",
      // /{bookId}
      episodes: "/chapters",
      // /{bookId}
      stream: "/watch/player",
      trending: "/rank/1",
      vip: "/new/1",
      categories: "/classify"
    },
    headers: {
      "User-Agent": "Dracin-Stream/2.0",
      "Accept": "application/json"
    },
    rateLimit: {
      requests: 60,
      period: 60
    },
    healthCheck: {
      endpoint: "/foryou/1",
      expectedStatus: 200,
      timeout: 5e3
    }
  },
  // API 4 - Backup 2 (Paxsenix Vercel)
  {
    id: "api_backup2",
    name: "Backup API 2 (Paxsenix)",
    baseUrl: "https://kdjekek-usieke-owjejxkek-iwjwjxkod.vercel.app",
    priority: 4,
    queryFormat: "path",
    endpoints: {
      home: "/api/home",
      search: "/api/search",
      // uses ?keyword= param
      detail: "/api/detail",
      // /{bookId}/v2
      episodes: "/api/chapters",
      // /{bookId}
      stream: "/api/stream",
      trending: "/api/recommend",
      vip: "/api/vip",
      categories: "/api/categories",
      category: "/api/category"
      // /{id}
    },
    headers: {
      "Accept": "application/json",
      "User-Agent": "Dracin-Stream/2.0"
    },
    rateLimit: {
      requests: 100,
      period: 60
    },
    healthCheck: {
      endpoint: "/api/home",
      expectedStatus: 200,
      timeout: 5e3
    }
  }
];
const DEFAULT_API_ID = "api_secondary";
function getAPIConfig(apiId) {
  return API_CONFIGS.find((api) => api.id === apiId);
}
export {
  API_CONFIGS as A,
  DEFAULT_API_ID as D,
  getAPIConfig as g
};
