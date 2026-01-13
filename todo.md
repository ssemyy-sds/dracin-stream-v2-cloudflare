# todo.md — 1 UI + 4 API adapters (Dracin Stream V2 on Cloudflare Pages)

## Goal
Make **all segments** (home, detail, player, etc.) always use **the same active API provider** (selected via Telegram bot/KV). Implement a clean **adapter architecture** so each API’s different JSON structure is handled in one place. App is SvelteKit deployed to Cloudflare Pages via `@sveltejs/adapter-cloudflare` [1].

---

## 0) Definitions / Constraints
- **UI must never call 3rd-party APIs directly.** UI calls only our internal endpoints: `/api/home`, `/api/recommend`, `/api/foryou`, `/api/detail`, `/api/player`, etc.
- Server chooses provider by reading `ACTIVE_PROVIDER` from Cloudflare KV (set by bot).
- **Standard internal models** (contract) returned by our internal endpoints:
  - `DramaCard` (for lists)
  - `DramaDetail`
  - `Episode`
  - `Stream`
- Each provider adapter must:
  - Build request URL/params/headers for that provider
  - Fetch
  - Normalize response into internal models
  - Throw typed errors with context (provider, endpoint, status, body snippet)

---

## 1) Create Internal Contract (shared types)
- [ ] Add `src/lib/api-contract/types.ts` with minimal stable shapes:

  - `ProviderId = 'api_primary' | 'api_secondary' | 'api_backup1' | 'api_backup2'`

  - `DramaId = string` (always string internally)

  - `DramaCard`:
    - `id: string`
    - `title: string`
    - `cover: string | null`
    - `episodeCount?: number | null`
    - `playCountText?: string | null`
    - `tags?: string[]`
    - `badge?: { text: string; color?: string } | null` (optional)

  - `DramaDetail`:
    - `id: string`
    - `title: string`
    - `cover: string | null`
    - `description?: string | null`
    - `tags?: string[]`
    - `episodes?: Episode[]` (if provider supports in detail response)

  - `Episode`:
    - `id: string` (episode/chapter id as string)
    - `dramaId: string`
    - `number?: number | null`
    - `title?: string | null`

  - `Stream`:
    - `url: string`
    - `type?: 'hls' | 'mp4' | 'unknown'`
    - `headers?: Record<string,string>` (rare cases)

- [ ] Add `src/lib/api-contract/normalize.ts` utilities:
  - `toStrId(x): string` (handles `bookId/book_id/id` and numeric ids)
  - `pickFirst(obj, keys[])`
  - `toNumberOrNull(x)`
  - `safeArray(x)`

---

## 2) Provider Adapter Interface
- [ ] Create `src/lib/providers/base.ts`:
  - `export interface ProviderAdapter {`
    - `id: ProviderId`
    - `label: string`
    - `capabilities: { home: boolean; recommend: boolean; foryou: boolean; detail: boolean; player: boolean }`
    - `home(params): Promise<DramaCard[]>`
    - `recommend(params): Promise<DramaCard[]>`
    - `foryou(params): Promise<DramaCard[]>`
    - `detail(id: string): Promise<DramaDetail>`
    - `player(args): Promise<Stream>` (or `episodes + stream` depending current design)
  - `}`

- [ ] Create `src/lib/providers/http.ts`:
  - `fetchJson(url, { timeoutMs, headers })` returning `{ status, json, text }`
  - Enforce timeout + better error with provider id + endpoint name.
  - Log only safe diagnostics (status, provider, path); never log secrets.

---

## 3) Central Provider Router (single source of truth)
- [ ] Create `src/lib/providers/index.ts`:
  - Register 4 adapters in a dictionary `providers: Record<ProviderId, ProviderAdapter>`
  - `getActiveProvider(platform): Promise<ProviderAdapter>` reading KV key `ACTIVE_PROVIDER`
  - If KV missing/invalid → default to `api_primary`
  - Provide helper `withProvider(platform, fn)`.

- [ ] Ensure all SvelteKit server routes that call APIs accept `platform` and pass it through:
  - `export const GET: RequestHandler = async ({ url, platform }) => { ... }`

---

## 4) Implement API Backup 1 Adapter (dramabos.asia)
Base URL: `https://dramabos.asia/api/dramabox/...` (cannot be tested locally due firewall; deploy-time tests needed).

### 4.1 Identify/confirm endpoints
- [ ] Add config file `src/lib/providers/backup1_dramabos/config.ts`:
  - `BASE_URL = 'https://dramabos.asia/api/dramabox'`
  - Define endpoint paths used by our internal endpoints (to be filled):
    - home list
    - recommend
    - foryou
    - detail
    - player/stream
- [ ] If endpoints not known yet:
  - Add TODO markers and implement only list normalization first.
  - Ask for actual paths from existing API1/API2 patterns or Postman collection.

### 4.2 Normalizer for list cards using provided sample
Use sample fields found in `1.json`: `cover`, `chapterCount`, `playCount`, `tags`, and sometimes `corner.name/color`, `rank.recCopy/hotCode` [4].

- [ ] Create `src/lib/providers/backup1_dramabos/normalize.ts`:
  - `normalizeDramaCard(item): DramaCard` mapping:
    - `id`:
      - use `bookId` if present else fallback to `book_id` else `id` (stringify)
    - `title`:
      - try `bookName` else `name` else `title`
    - `cover`:
      - `cover ?? null` [4]
    - `episodeCount`:
      - `chapterCount ?? null` [4]
    - `playCountText`:
      - `playCount ?? null` [4]
    - `tags`:
      - `tags ?? []` [4]
    - `badge` (optional):
      - if `corner?.name` exists → `{ text: corner.name, color: corner.color }` [4]
      - else if `rank?.recCopy` exists → `{ text: rank.recCopy }` [4]

- [ ] Create `normalizeListResponse(json): DramaCard[]`:
  - Handle response wrappers commonly seen: `data.list`, `data.records`, `data`, `list`, etc.
  - If cannot find array → throw `ProviderParseError` with `keys present` debug.

### 4.3 Implement adapter methods
- [ ] Create `src/lib/providers/backup1_dramabos/adapter.ts` implementing `ProviderAdapter`:
  - `home/recommend/foryou` fetch correct URL + normalize list.
  - `detail/player` initially stub with “not implemented” but returning typed error until endpoints confirmed.

- [ ] Register adapter in `providers/index.ts` as `api_backup1`.

---

## 5) Refactor existing API1 & API2 into adapters (no mixed usage)
- [ ] Move existing logic for API1 into `src/lib/providers/primary/adapter.ts`
- [ ] Move existing logic for API2 into `src/lib/providers/secondary/adapter.ts`
- [ ] Ensure both normalize to the same internal contract.
- [ ] Add `backup2` placeholder adapter (config + skeleton) to make adding later trivial.

---

## 6) Update SvelteKit internal API routes to use provider router ONLY
For each route below, remove any direct reference to API1/API2 base URLs.
- [ ] `src/routes/api/home/+server.ts`:
  - parse `page,size`
  - call `active.home({ page, size })`
  - return `{ provider: active.id, items }` (provider optional but useful)

- [ ] `src/routes/api/recommend/+server.ts`
- [ ] `src/routes/api/foryou/+server.ts`
- [ ] `src/routes/api/detail/+server.ts` or `/api/detail/[id]`
- [ ] `src/routes/api/player/+server.ts` (or your existing naming)

- [ ] Add `src/routes/api/provider/+server.ts`:
  - returns current active provider id/label (debug UI + helps verify bot switch)

---

## 7) KV + Bot Switch: ensure consistency + cache invalidation
- [ ] Confirm KV key name used by bot matches server: `ACTIVE_PROVIDER`
- [ ] On bot `/switch <provider>`:
  - validate provider exists in registry
  - set KV key `ACTIVE_PROVIDER=<providerId>`
  - optionally bump KV `PROVIDER_VERSION` (integer) to help client cache bust

- [ ] If you implemented caching:
  - ensure cache keys include `providerId` (and `PROVIDER_VERSION` if used)
  - on switch, either:
    - no server cache, or
    - cache segregated per provider

---

## 8) Error Handling: avoid blank UI after switch
- [ ] Standardize error response for internal endpoints:
  - HTTP status `502` for upstream failures (not 500)
  - JSON:
    - `{ error: { message, provider, endpoint, upstreamStatus? } }`
- [ ] Frontend should display a friendly state: “Provider X error, try again / report”.
- [ ] Add fallback logic (optional, controlled):
  - If active provider fails for list endpoints, optionally try next provider in priority order.
  - If fallback used, return `providerUsed` so you can detect auto failover.

---

## 9) Testing Plan (Cloudflare + local)
Because dramabos is blocked in your current network, rely on deployed tests.
- [ ] Add a server route `GET /api/_smoke?provider=api_backup1&endpoint=home`:
  - bypass active provider and force a provider for testing
  - protected by a secret token query param (or only enabled in preview)
- [ ] Run smoke tests after deploy:
  - `/api/_smoke?provider=api_backup1&endpoint=home&token=...`
  - ensure it returns normalized `DramaCard[]` with fields populated from sample mapping (cover/chapterCount/playCount/tags) [4].

---

## 10) Docs: add “How to add new provider”
- [ ] Write `docs/providers.md`:
  - Steps: create folder, config endpoints, implement normalize, register in index, add to bot list.
  - Include common field mapping patterns (`bookId/book_id/id`).

---

## Info needed from you (blockers)
- [ ] Provide dramabos endpoints for:
  - home/recommend/foryou/detail/player
- [ ] Provide sample JSON for dramabos **detail** and **player/stream** responses (list sample already partially available) [4]
- [ ] Confirm whether “player” requires episodes list first or direct stream URL.

---