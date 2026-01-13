import { D as DEFAULT_API_ID, g as getAPIConfig } from "../../../../../chunks/apis.config.js";
const GET = async ({ url, params, platform }) => {
  const path = params.path;
  if (path === "health") {
    return new Response(null, { status: 404 });
  }
  let providerId = url.searchParams.get("provider");
  if (!providerId) {
    try {
      if (platform?.env?.API_CONFIG) {
        const config = await platform.env.API_CONFIG.get("config", "json");
        if (config && config.activeApiId) {
          providerId = config.activeApiId;
        }
      }
    } catch (e) {
      console.error("Failed to read from KV:", e);
    }
  }
  if (!providerId) {
    providerId = DEFAULT_API_ID;
  }
  const apiConfig = getAPIConfig(providerId) || getAPIConfig(DEFAULT_API_ID);
  console.log(`[API Proxy] Using provider: ${apiConfig.name} (${apiConfig.id})`);
  const queryParams = new URLSearchParams();
  url.searchParams.forEach((value, key) => {
    if (key !== "provider") {
      queryParams.set(key, value);
    }
  });
  let targetUrl;
  let actionPath = path || "";
  if (apiConfig.queryFormat === "action") {
    const actionMap = {
      "allepisode": "chapters",
      // Secondary uses 'chapters' not 'allepisode'
      "trending": "home",
      // Secondary uses 'home' for trending
      "foryou": "recommend"
      // Secondary uses 'recommend' for foryou
    };
    const mappedAction = actionMap[actionPath] || actionPath;
    queryParams.set("action", mappedAction);
    if (queryParams.has("bookId")) {
      const bookIdValue = queryParams.get("bookId");
      queryParams.delete("bookId");
      queryParams.set("book_id", bookIdValue);
    }
    if (queryParams.has("chapterId")) {
      const chapterIdValue = queryParams.get("chapterId");
      queryParams.delete("chapterId");
      queryParams.set("chapter_id", chapterIdValue);
    }
    if (mappedAction === "vip") {
      queryParams.delete("page");
      queryParams.delete("size");
    }
    targetUrl = `${apiConfig.baseUrl}?${queryParams.toString()}`;
    console.log(`[API Proxy] Mapped action: ${actionPath} -> ${mappedAction}`);
  } else {
    const bookId = queryParams.get("bookId");
    const chapterId = queryParams.get("chapterId");
    const keyword = queryParams.get("query") || queryParams.get("keyword");
    const page = queryParams.get("page") || "1";
    if (apiConfig.id === "api_backup1") {
      const dramabosMap = {
        "home": `/foryou/${page}`,
        "trending": `/rank/${page}`,
        "foryou": `/foryou/${page}`,
        "vip": `/new/${page}`,
        "search": keyword ? `/search/${encodeURIComponent(keyword)}/1` : "/search/drama/1",
        "detail": bookId ? `/drama/${bookId}` : "/drama",
        "allepisode": bookId ? `/chapters/${bookId}` : "/chapters",
        "stream": `/watch/player?bookId=${bookId}&chapterId=${chapterId}`,
        "categories": "/classify"
      };
      const mappedPath = dramabosMap[actionPath] || `/${actionPath}`;
      targetUrl = `${apiConfig.baseUrl}${mappedPath}`;
      console.log(`[API Proxy] Dramabos mapped: ${actionPath} -> ${mappedPath}`);
    } else if (apiConfig.id === "api_backup2") {
      const paxsenixMap = {
        "home": "/api/home",
        "trending": "/api/recommend",
        "recommend": "/api/recommend",
        "foryou": "/api/home",
        "vip": "/api/vip",
        "search": "/api/search",
        "detail": "/api/download",
        "allepisode": "/api/download",
        "stream": "/api/download",
        "categories": "/api/categories"
      };
      const mappedPath = paxsenixMap[actionPath] || `/api/${actionPath}`;
      const paxParams = new URLSearchParams();
      if (keyword) paxParams.set("keyword", keyword);
      if (page !== "1") paxParams.set("page", page);
      if (bookId) paxParams.set("bookId", bookId);
      if (chapterId) paxParams.set("chapterId", chapterId);
      const paxQuery = paxParams.toString();
      targetUrl = `${apiConfig.baseUrl}${mappedPath}${paxQuery ? "?" + paxQuery : ""}`;
      console.log(`[API Proxy] Paxsenix mapped: ${actionPath} -> ${mappedPath}`);
    } else {
      if (actionPath === "home") {
        actionPath = "trending";
      } else if (actionPath === "recommend") {
        actionPath = "randomdrama";
      } else if (actionPath === "detail") {
        actionPath = "allepisode";
      }
      const queryString = queryParams.toString();
      targetUrl = `${apiConfig.baseUrl}/${actionPath}${queryString ? "?" + queryString : ""}`;
    }
  }
  console.log("[API Proxy] targetUrl:", targetUrl);
  try {
    const response = await fetch(targetUrl, {
      headers: apiConfig.headers || {}
    });
    console.log(`[API Proxy] Upstream status: ${response.status} for ${path}`);
    if (!response.ok) {
      let errorDetail = "Unknown upstream error";
      try {
        const errorBody = await response.text();
        errorDetail = errorBody.substring(0, 500);
        console.error(`[API Proxy] Upstream error (${response.status}):`, errorDetail);
      } catch (e) {
        console.error("[API Proxy] Failed to read upstream error body");
      }
      return new Response(JSON.stringify({
        error: "Upstream API error",
        status: response.status,
        detail: errorDetail,
        provider: apiConfig.id,
        targetUrl
      }), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "X-Active-Provider": apiConfig.id
        }
      });
    }
    const data = await response.json();
    if (data === null || data === void 0) {
      console.warn("[API Proxy] Empty response from upstream");
      return new Response(JSON.stringify({
        error: "Empty response from API",
        provider: apiConfig.id
      }), {
        status: 502,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "X-Active-Provider": apiConfig.id
        }
      });
    }
    if (data.error || data.code === "error" || data.success === false) {
      console.warn("[API Proxy] API returned error:", data.error || data.message);
    }
    const responseHeaders = new Headers({
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "X-Active-Provider": apiConfig.id
    });
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: responseHeaders
    });
  } catch (error) {
    console.error("[API Proxy] Fetch error:", error.message);
    return new Response(JSON.stringify({
      error: "Proxy fetch failed",
      detail: error.message,
      provider: apiConfig?.id || "unknown"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};
export {
  GET
};
