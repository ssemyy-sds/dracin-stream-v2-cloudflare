# Home Page API Calls

> **Last Updated:** 2026-01-13  
> **Status:** ⏳ Pending Review  
> Add your comments below each API section if you find any incorrect URL calls.

---

## Overview

The home page (`src/routes/+page.svelte`) calls **3 APIs** on mount:

```typescript
const [home, recommend, vip] = await Promise.all([
  getHome(1, 20),
  getRecommend(1, 20),
  getVip(1, 20),
]);
```

---

## 1. 🏠 Featured Section - `getHome()`

| Property | Value |
|----------|-------|
| **Frontend Call** | `getHome(1, 20)` |
| **Proxy URL** | `/api/proxy/home?page=1&size=20` |

### Provider-specific URLs

| Provider | Final URL |
|----------|-----------|
| `api_secondary` (Gimita) | `https://api.gimita.id/api/search/dramabox?action=home&page=1&size=20` |
| `api_backup1` (Dramabos) | `https://dramabos.asia/api/dramabox/foryou/1` |
| `api_primary` (Sansekai) ✅ DEFAULT | `https://api.sansekai.my.id/api/dramabox/trending?page=1&size=20` |
| `api_backup4` (Dramabox Sansekai) ✅ Working | `https://dramabox.sansekai.my.id/api/dramabox/trending?page=1&size=20` |
| `api_backup2` (Paxsenix) | `https://kdjekek-usieke-owjejxkek-iwjwjxkod.vercel.app/api/home` |

### Your Comments
<!-- Add your comments about incorrect URLs here 
OK
-->
---

## 2. 🎯 Rekomendasi Section - `getRecommend()`

| Property | Value |
|----------|-------|
| **Frontend Call** | `getRecommend(1, 20)` |
| **Proxy URL** | `/api/proxy/recommend?page=1&size=20` |

### Provider-specific URLs

| Provider | Final URL |
|----------|-----------|
| `api_secondary` (Gimita) | `https://api.gimita.id/api/search/dramabox?action=recommend&page=1&size=20` |
| `api_backup1` (Dramabos) | ❌ No `recommend` endpoint, fallback to `getForYou()` → `home` |
| `api_primary` (Sansekai) ✅ Working | `https://api.sansekai.my.id/api/dramabox/randomdrama` |
| `api_backup2` (Paxsenix) | `https://kdjekek-usieke-owjejxkek-iwjwjxkod.vercel.app/api/recommend` |
| `api_backup4` (Dramabox Sansekai) ✅ Working | `https://dramabox.sansekai.my.id/api/dramabox/randomdrama` |

### Your Comments
<!-- Add your comments about incorrect URLs here

for api_primary please use below URL call instead
https://api.sansekai.my.id/api/dramabox/randomdrama

-->
---

## 3. 👑 VIP Content Section - `getVip()`

| Property | Value |
|----------|-------|
| **Frontend Call** | `getVip(1, 20)` |
| **Proxy URL** | `/api/proxy/vip?page=1` |

### Provider-specific URLs

| Provider | Final URL |
|----------|-----------|
| `api_secondary` (Gimita) | `https://api.gimita.id/api/search/dramabox?action=vip` (Params removed) |
| `api_backup1` (Dramabos) | `https://dramabos.asia/api/dramabox/new/1` |
| `api_primary` (Sansekai) ✅ Working | `https://api.sansekai.my.id/api/dramabox/vip` |
| `api_backup2` (Paxsenix) | `https://kdjekek-usieke-owjejxkek-iwjwjxkod.vercel.app/api/vip` |
| `api_backup4` (Dramabox Sansekai) ✅ Working | `https://dramabox.sansekai.my.id/api/dramabox/vip` |

### Your Comments
<!-- Add your comments about incorrect URLs here
for api_secondary` please use below URL call instead
"https://api.gimita.id/api/search/dramabox?action=vip"

for api_primary please use below URL call instead
"https://api.sansekai.my.id/api/dramabox/vip"
-->
---

# Detail, Playback, and Search API Calls

## 4. 📄 Detail Page - `getDramaDetail()`

| Property | Value |
|----------|-------|
| **Frontend Call** | `getDramaDetail(bookId)` |
| **Proxy URL** | `/api/proxy/detail?bookId={bookId}` |

### Provider-specific URLs (Example `bookId` = `12345`)

| Provider | Final URL |
|----------|-----------|
| `api_secondary` (Gimita) | `https://api.gimita.id/api/search/dramabox?action=detail&book_id=12345` |
| `api_backup1` (Dramabos) | `https://dramabos.asia/api/dramabox/drama/12345` |
| `api_primary` (Sansekai) ✅ Working | `https://api.sansekai.my.id/api/dramabox/detail?bookId=12345` |
| `api_backup2` (Paxsenix) | `https://kdjekek-usieke-owjejxkek-iwjwjxkod.vercel.app/api/detail/12345/v2` |
| `api_backup4` (Dramabox Sansekai) ✅ Working | `https://dramabox.sansekai.my.id/api/dramabox/detail?bookId=12345` |

### Your Comments
<!-- Add your comments about incorrect URLs here 
for api_primary please use below URL call instead
https://api.sansekai.my.id/api/dramabox/allepisode?bookId=12345

for api_secondary please use below URL call instead
https://api.gimita.id/api/search/dramabox?action=chapters&book_id=12345

for api_backup1 please use below URL call instead
https://dramabos.asia/api/dramabox/drama/{bookID}

for api_backup2 please use below URL call instead
`https://kdjekek-usieke-owjejxkek-iwjwjxkod.vercel.app/api/download/bookId=12345`
-->
---

## 5. 🎬 Playback: Episode List - `getAllEpisodes()`

| Property | Value |
|----------|-------|
| **Frontend Call** | `getAllEpisodes(bookId)` |
| **Proxy URL** | `/api/proxy/allepisode?bookId={bookId}` |

### Provider-specific URLs (Example `bookId` = `12345`)

| Provider | Final URL |
|----------|-----------|
| `api_secondary` (Gimita) | `https://api.gimita.id/api/search/dramabox?action=chapters&book_id=12345` |
| `api_backup1` (Dramabos) | `https://dramabos.asia/api/dramabox/chapters/12345` |
| `api_primary` (Sansekai) ✅ Working | `https://api.sansekai.my.id/api/dramabox/allepisode?bookId=12345` |
| `api_backup2` (Paxsenix) | `https://kdjekek-usieke-owjejxkek-iwjwjxkod.vercel.app/api/chapters/12345` |
| `api_backup4` (Dramabox Sansekai) ✅ Working | `https://dramabox.sansekai.my.id/api/dramabox/allepisode?bookId=12345` |

### Your Comments
<!-- Add your comments about incorrect URLs here 
for api_backup2 please use below URL call instead
`https://kdjekek-usieke-owjejxkek-iwjwjxkod.vercel.app/api/download/bookId=12345`
-->
---

## 6. 🎥 Playback: Video Stream - `getStreamUrl()`

_Note: This is only called if the episode list doesn't contain video URLs._

| Property | Value |
|----------|-------|
| **Frontend Call** | `getStreamUrl(bookId, episodeNum)` (Calls internal `stream` endpoint) |
| **Proxy URL** | `/api/proxy/stream?bookId={bookId}&chapterId={chapterId}` |

### Provider-specific URLs (Example `bookId`= `123`, `chapterId` = `456`)

| Provider | Final URL |
|----------|-----------|
| `api_secondary` (Gimita) | `https://api.gimita.id/api/search/dramabox?action=stream&book_id=123&chapter_id=456` |
| `api_backup1` (Dramabos) | `https://dramabos.asia/api/dramabox/watch/player?bookId=123&chapterId=456` |
| `api_primary` (Sansekai) ✅ Working | `https://api.sansekai.my.id/api/dramabox/allepisode?bookId=123` |
| `api_backup2` (Paxsenix) | `https://kdjekek-usieke-owjejxkek-iwjwjxkod.vercel.app/api/stream?bookId=123&chapterId=456` |
| `api_backup4` (Dramabox Sansekai) ✅ Working | `https://dramabox.sansekai.my.id/api/dramabox/allepisode?bookId=123` |

### Your Comments
<!-- Add your comments about incorrect URLs here 
for stream should be take same from getAllEpisodes() and looking for/findings parameter videoPath ussualy begin with "https://hwztvideo.dramaboxdb.com/"

-->
---

## 7. 🔍 Search Page - `searchDramas()`

| Property | Value |
|----------|-------|
| **Frontend Call** | `searchDramas(query)` |
| **Proxy URL** | `/api/proxy/search?query={query}` |

### Provider-specific URLs (Example `query` = `love`)

| Provider | Final URL |
|----------|-----------|
| `api_secondary` (Gimita) | `https://api.gimita.id/api/search/dramabox?action=search&query=love` (Note: Uses `query` param currently) |
| `api_backup1` (Dramabos) | `https://dramabos.asia/api/dramabox/search/love/1` |
| `api_primary` (Sansekai) ✅ Working | `https://api.sansekai.my.id/api/dramabox/search?query=love` |
| `api_backup2` (Paxsenix) | `https://kdjekek-usieke-owjejxkek-iwjwjxkod.vercel.app/api/search?keyword=love` |
| `api_backup4` (Dramabox Sansekai) ✅ Working | `https://dramabox.sansekai.my.id/api/dramabox/search?query=love` |

### Your Comments
<!-- Add your comments about incorrect URLs here -->
for api_backup1 please use below URL call instead
 `https://dramabos.asia/api/dramabox/search/{query}/1`
 
 
---

## Summary of Issues Found

> **Add your findings here:**

| # | Endpoint | Provider | Issue Description | Status |
|---|----------|----------|-------------------|--------|
| 1 | | | | ⏳ Pending |
| 2 | | | | ⏳ Pending |
| 3 | | | | ⏳ Pending |
