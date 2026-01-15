# Dramabos (api_backup1) Implementation & Algorithm Strategy

## 1. Request Flow Overview
User Action -> Frontend (`api.ts`) -> Proxy Server (`+server.ts`) -> Dramabos API -> Normalization -> UI

## 2. Proxy Server Algorithm (`src/routes/api/proxy/[...path]/+server.ts`)
The proxy detects `api_backup1` and applies specific mapping logic:

```typescript
// Algorithm:
// 1. Get query params (bookId, chapterId, page, size)
// 2. Map frontend parameters to Dramabos parameters
// 3. Page -> Offset calculation: (page - 1) * size
// 4. Default lang set to 'id'

if (apiConfig.id === 'api_backup1') {
    const pageNum = parseInt(queryParams.get('page') || '1');
    const sizeNum = parseInt(queryParams.get('size') || '18');
    const offset = (pageNum - 1) * sizeNum;
    const lang = queryParams.get('lang') || 'id';

    const dramabosMap: Record<string, string> = {
        'home': `/home?offset=${offset}&count=${sizeNum}&lang=${lang}`,
        'search': `/search?q=${encodeURIComponent(keyword)}&lang=${lang}`,
        'detail': `/detail/${bookId}?lang=${lang}`,
        'allepisode': `/detail/${bookId}?lang=${lang}`, // Episodes are nested in detail
        'stream': `/video/${chapterId}?lang=${lang}`,
    };
    
    // Final URL construction: baseUrl + mappedPath
}
```

## 3. Data Normalization Algorithm (`src/lib/services/normalizers.ts`)
Converts raw JSON from Dramabos to Dracin Stream standard objects.

### Drama metadata:
- Maps `id` -> `bookId`
- Maps `title` -> `bookName`
- Maps `episodes` -> `latestEpisode` & `chapterCount`
- Maps `intro` or `introduction` -> `introduction`
- Maps `cover` -> `cover` (runs through `fixUrl`)

### Episode/Chapter list:
Dramabos returns episodes inside a `videos` array within the `detail` response.
- Maps `vid` -> `chapterId`
- Maps `episode` -> `chapterIndex` (numeric)
- Maps `episode` -> `chapterName` (e.g. "Episode 1")

## 4. Video Stream Algorithm (`src/lib/services/api.ts`)
How the video URL is extracted from the `/video/{vid}` response:

```typescript
function normalizeStreamResponse(streamData) {
    let options = [];

    // 1. Handle Dramabos 'list' array (Multi-quality)
    if (streamData.list) {
        streamData.list.forEach(item => {
            options.push({
                quality: parseInt(item.definition), // "540p" -> 540
                videoUrl: fixUrl(item.url)
            });
        });
    }

    // 2. Handle Root 'url' (Primary stream)
    const rootUrl = streamData.url || streamData.videoUrl;
    if (rootUrl && !options.some(o => o.videoUrl === fixUrl(rootUrl))) {
        options.push({
            quality: parseInt(streamData.definition) || 720,
            videoUrl: fixUrl(rootUrl),
            isDefault: options.length === 0
        });
    }

    // 3. Sort Descending (720 -> 540 -> 240)
    return options.sort((a, b) => b.quality - a.quality);
}
```

## 5. Image & URL Fixer Algorithm (`src/lib/utils/helpers.ts`)
Crucial for images and potential protocol issues.

```typescript
function fixUrl(url) {
    // 1. Convert .heic to WebP via wsrv.nl proxy
    // 2. Prevent double-proxying (check if wsrv.nl already in URL)
    if (url.includes('.heic') && !url.includes('wsrv.nl')) {
        return `https://wsrv.nl/?url=${encodeURIComponent(url)}&output=webp`;
    }
    // 3. Add https: if missing
}
```

## 6. Video Player Playback Fixes
To bypass cross-domain restrictions (CORS/Referer):
- **Referrer Policy**: Set to `no-referrer` on the `<video>` tag.
- **Protocol**: Always ensured `https` via `fixUrl`.

## 7. Current Mapped Target URLs (Summary)
- **Home**: `https://dramabos.asia/api/melolo/api/v1/home?offset=0&count=20&lang=id`
- **Detail**: `https://dramabos.asia/api/melolo/api/v1/detail/{id}?lang=id`
- **Stream**: `https://dramabos.asia/api/melolo/api/v1/video/{vid}?lang=id`
