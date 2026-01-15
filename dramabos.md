#melolo dramabos.asia

#to check API health
https://dramabos.asia/api/melolo/health

#base URL 
https://dramabos.asia/api/melolo/api/v1

#for home page
https://dramabos.asia/api/melolo/api/v1/home?offset=0&count=18&lang=id
or only
https://dramabos.asia/api/melolo/api/v1/home

#for search
https://dramabos.asia/api/melolo/api/v1/search?q={query}

#for detail page
https://dramabos.asia/api/melolo/api/v1/detail/7582204628406651909?lang=id
or only
https://dramabos.asia/api/melolo/api/v1/detail/{id}

#for player
https://dramabos.asia/api/melolo/api/v1/video/7582232554074278965?lang=id
or only
https://dramabos.asia/api/melolo/api/v1/video/{vid}

# Current Code Configuration (api_backup1) - Updated 2026-01-15

## Base URL
`https://dramabos.asia/api/melolo/api/v1`

## Home Page Call
**Code**: `src/routes/api/proxy/[...path]/+server.ts`
**Mapping**: `home` -> `/home?offset=${offset}&count=${sizeNum}&lang=${lang}`
**Calculation**: `offset = (page - 1) * size`
**Resulting URL example**: `https://dramabos.asia/api/melolo/api/v1/home?offset=0&count=20&lang=id`

## Detail Page Call
**Code**: `src/routes/api/proxy/[...path]/+server.ts`
**Mapping**: `detail` -> `/detail/${bookId}?lang=${lang}`
**Resulting URL example**: `https://dramabos.asia/api/melolo/api/v1/detail/7582204628406651909?lang=id`

## Search Call
**Code**: `src/routes/api/proxy/[...path]/+server.ts`
**Mapping**: `search` -> `/search?q=${encodeURIComponent(keyword)}&lang=${lang}`
**Resulting URL example**: `https://dramabos.asia/api/melolo/api/v1/search?q=drama&lang=id`

## Video Player Call
**Code**: `src/routes/api/proxy/[...path]/+server.ts`
**Mapping**: `stream` -> `/video/${chapterId}?lang=${lang}`
**Resulting URL example**: `https://dramabos.asia/api/melolo/api/v1/video/7582232554074278965?lang=id`

## Image Handling & Fixes
- **Extension Check**: Case-insensitive check for `.heic`
- **Double Proxy Prevention**: Fixed bug where images would be proxied twice if `fixUrl` was called multiple times.
- **Image Proxy**: Using `wsrv.nl` for HEIC to WebP conversion.
- **Referrer Policy**: Set to `no-referrer` in `DramaCard.svelte` and `+page.svelte`.
- **Fallback**: Placeholder image shown if proxy fails.
- **Log**: Added `[fixUrl] Converting HEIC:` console log for tracking.
