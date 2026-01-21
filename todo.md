
# TODO: Enhance **Dracinku** (SvelteKit) to Support K‑Drama (Drakor) with Mode‑Selection Popup

> **Target stack:** **SvelteKit** (FE), **Tailwind/CSS** (styles), **GET APIs** (BE base URL), **Cloudflare Workers** (runtime/deploy)
> **Author intent:** Keep the existing **Dracin** homepage fully intact (already productive). Add **Drakor** as a **separate homepage** and show a **floating user‑selection popup** on the current home.

---

## 1) Business Context & Goals
- Current production: **Dracin** only. Goal: add **Drakor** without breaking Dracin UX/SEO/perf.
- Add **floating selection popup** on `/` with options **Dracin** (Short Drama China Viral) and **Drakor** (Drama Korea Terbaru).
- If user picks **Dracin** → **stay** on existing home (`/`). If **Drakor** → **navigate** to a new dedicated homepage (`/drakor`).
- Persist user choice (cookie + localStorage). Returning users land directly on their last mode. Also add a **header mode switcher**.

**Non‑goals:** Rewrite Dracin; alter Dracin SEO; change existing Dracin data contracts.

---

## 2) High‑Level Requirements
1. **Floating Mode Popup** (first visit to `/` or when no preference): accessible, keyboard friendly, WCAG AA contrast.
2. **Dedicated Drakor homepage** at `/drakor`: its own layout/sections/SEO. Keep it decoupled from Dracin.
3. **Preference persistence & routing**:
   - `localStorage['contentMode'] ∈ { 'dracin', 'drakor' }` and cookie `contentMode=dracin|drakor`.
   - Server‑side redirect on `/` to `/drakor` if cookie says drakor (and feature flag enabled).
   - Header **Mode Switcher** to toggle modes and update persistence.
4. **Feature Flags** (Cloudflare Env): `DRAKOR_ENABLED`, `MODE_POPUP_ENABLED`.
5. **Performance**: code split Drakor; prefetch `/drakor` on intent; cache API reads.
6. **Security/Privacy**: Only functional cookies; SameSite=Lax; sanitize dynamic HTML.

---

## 3) Architecture & Routes (SvelteKit)
- Root: `/` → **existing Dracin homepage** (do not break). Integrate popup component gated by `MODE_POPUP_ENABLED`.
- Drakor: `/drakor` → new homepage; optional deep links (later):
  - `/drakor/title/[slug]`
  - `/drakor/genre/[name]`

**Preference Storage**
- Client: `localStorage['contentMode'] = 'dracin' | 'drakor'`
- Cookie: `contentMode=dracin|drakor; Path=/; Max-Age=31536000; SameSite=Lax`

---

## 4) UX Specs
### 4.1 Floating Popup (on `/`)
- Title: **"Choose your content mode"**
- Cards:
  1. **Dracin** — *Short Drama China Viral*
  2. **Drakor** — *Drama Korea Terbaru*
- Behavior:
  - Select Dracin → persist preference → close popup → remain on `/`.
  - Select Drakor → persist preference → navigate to `/drakor`.
- Accessibility:
  - `role="dialog"`, `aria-modal=true`, labeled heading, ESC‑to‑close, focus management.

### 4.2 Header Mode Switcher
- Compact segmented control or dropdown.
- Switching updates cookie + localStorage and navigates to the chosen mode.

---

## 5) Data & API (Drakor)
New **read‑only** endpoints (GET):
- `GET {API_BASE_URL}/api/drakor/home` → `{ hero, trending, newReleases, topRated, genres }`
-https://dramabos.asia/api/dramaid/home?page=1
JSON Response for home :
"date": "5 days ago",
      "episode": "1 - 30",
      "negara": "China",
      "score": "8.2",
      "genres": "Drama, Romance, Youth",
      "rating": "13",
      "duration": "45 min."
    },
    {
      "title": "Dark Night and Dawn Subtitle Indonesia",
      "slug": "dark-night-and-dawn",
      "img": "https://drama-id.com/wp-content/uploads/2026/01/Dark-Night-and-Dawn-Jjy.webp",
      "date": "5 days ago",
      "episode": "1 - 36",
      "negara": "China",
      "score": "8.0",
      "genres": "Crime, Historical, Mystery, Thriller",
      "rating": "13",
      "duration": "45 min."
    },
    {
      "title": "Echo of Her Voice Subtitle Indonesia",
      "slug": "echo-of-her-voice",
      "img": "https://drama-id.com/wp-content/uploads/2026/01/Echo-of-Her-Voice-jpU.webp",
      "date": "5 days ago",
      "episode": "1 - 24",
      "negara": "China",
      "score": "7.7",
      "genres": "Comedy, Historical, Romance, Supernatural",
      "rating": "13",
      "duration": "45 min."
    },
    {
      "title": "Please Remember Me Subtitle Indonesia",
      "slug": "please-remember-me",
      "img": "https://drama-id.com/wp-content/uploads/2026/01/Please-Remember-Me-Oa4.webp",
      "date": "5 days ago",
      "episode": "1 - 30",
      "negara": "China",
      "score": "7.3",
      "genres": "Fantasy, Historical, Romance, Thriller",
      "rating": "13",
      "duration": "15 min."
    },
    {
      "title": "The Judge Returns Subtitle Indonesia",
      "slug": "the-judge-returns",
      "img": "https://drama-id.com/wp-content/uploads/2026/01/The-Judge-Returns-J2u.webp",
      "date": "11 hours ago",
      "episode": "1 - 5",
      "negara": "Korea Selatan",
      "score": "7.8",
      "genres": "Action, Fantasy, Law, Mystery",
      "rating": "15",
      "duration": "1 hr. 10 min."
    }
  ]
}
- `GET {API_BASE_URL}/api/drakor/play/{title}/{episode}`
https://dramabos.asia/api/dramaid/play/the-judge-returns/1
JSON Response for play :
{
  "code": 0,
  "data": {
    "slug": "the-judge-returns",
    "episode": "1",
    "streams": [
      {
        "quality": "360p",
        "url": "https://dl.berkasdrive.com/new/?id=t8k7ym8992e46b&name=_Drakorindo.app_360p-the-judge-returns-2026-ep1.mp4"
      },
      {
        "quality": "480p",
        "url": "https://dl.berkasdrive.com/new/?id=t8k7ysd55e32ee&name=_Drakorindo.app_480p-the-judge-returns-2026-ep1.mp4"
      },
      {
        "quality": "720p",
        "url": "https://dl.berkasdrive.com/new/?id=t8k7z3d67459e2&name=_Drakorindo.app_720p-the-judge-returns-2026-ep1.mp4"
      }
    ]
  }
}

- `GET {API_BASE_URL}/api/drakor/detail/{title}` → metadata + episodes + availability
https://dramabos.asia/api/dramaid/detail/the-judge-returns
JSON Response for detail:
{
  "code": 0,
  "data": {
    "title": "Nonton Drakor The Judge Returns (2026) Sub Indo",
    "poster": "https://drama-id.com/wp-content/uploads/2026/01/poster-drama-The-Judge-Returns-south-korea.webp",
    "synopsis": "The Judge Returns bercerita tentang Lee Han Yeong, seorang hakim yang berjuang menghadapi rasa bersalah setelah menggunakan posisinya untuk keuntungan firma hukum mertuanya. Ketika ia menjatuhkan hukuman seumur hidup kepada seorang ketua korup, ia terbunuh dan terbangun sepuluh tahun ke belakang. Memanfaatkan kesempatan kedua ini, Han Yeong, dengan bantuan jaksa Kim Jin A, berusaha menegakkan keadilan.",
    "judul": "The Judge Returns",
    "judul_asli": "판사 이한영",
    "series": "The Judge Returns",
    "genres": [
      "Action",
      "Fantasy",
      "Law",
      "Mystery"
    ],
    "durasi": "1 hr. 10 min.",
    "skor": "7.8",
    "director": "Lee Jae Jin",
    "tipe": "Drama",
    "negara": "Korea Selatan",
    "status": "Ongoing",
    "tahun": "2026",
    "rating_usia": "15",
    "original_network": "MBC",
    "episodes": [
      {
        "ep": 1
      },
      {
        "ep": 2
      },
      {
        "ep": 3
      },
      {
        "ep": 4
      },
      {
        "ep": 5
      }
    ],
    "recommendations": [
      {
        "title": "Taxi Driver Season 3 Subtitle Indonesia",
        "slug": "taxi-driver-season-3",
        "img": "https://drama-id.com/wp-content/uploads/2025/12/Taxi-Driver-Season-3-xLV.webp"
      },
      {
        "title": "Pro Bono Subtitle Indonesia",
        "slug": "pro-bono",
        "img": "https://drama-id.com/wp-content/uploads/2025/12/Pro-Bono-499.webp"
      },
      {
        "title": "Made in Korea Subtitle Indonesia",
        "slug": "made-in-korea",
        "img": "https://drama-id.com/wp-content/uploads/2025/12/Made-in-Korea-Fao.webp"
      },
      {
        "title": "Idol I Subtitle Indonesia",
        "slug": "idol-i",
        "img": "https://drama-id.com/wp-content/uploads/2025/12/Idol-I-ro7.webp"
      }
    ]
  }
}

- `GET {API_BASE_URL}/api/drakor/search?q=...`
https://dramabos.asia/api/dramaid/search?q=cinta
JSON Response for search :
{
  "code": 0,
  "data": [
    {
      "title": "Nonton Drama Beloved of a Lifetime (2024) Sub Indo",
      "slug": "beloved-of-a-lifetime"
    },
    {
      "title": "Nonton Drama Beloved of a Lifetime (2024) Sub Indo",
      "slug": "beloved-of-a-lifetime",
      "img": "https://drama-id.com/wp-content/uploads/2026/01/Beloved-of-a-Lifetime-IdT.webp"
    },
    {
      "title": "Nonton Drakor Hero Is Back (2022) Sub Indo",
      "slug": "hero-is-back"
    },
    {
      "title": "Nonton Drakor Hero Is Back (2022) Sub Indo",
      "slug": "hero-is-back",
      "img": "https://drama-id.com/wp-content/uploads/2026/01/Hero-Is-Back-KF2.webp"
    },
    {
      "title": "Nonton Drama In Between (2024) Sub Indo",
      "slug": "in-between"
    },
    {
      "title": "Nonton Drama In Between (2024) Sub Indo",
      "slug": "in-between",
      "img": "https://drama-id.com/wp-content/uploads/2026/01/In-Between-Y7N.webp"
    },
    {
      "title": "Nonton Drama A Talented Girl Grows Up (2024) Sub Indo",
      "slug": "a-talented-girl-grows-up"
    },
    {
      "title": "Nonton Drama A Talented Girl Grows Up (2024) Sub Indo",
      "slug": "a-talented-girl-grows-up",
      "img": "https://drama-id.com/wp-content/uploads/2026/01/A-Talented-Girl-Grows-Up-Pig.webp"
    },
    {
      "title": "Nonton Drama You Are My Lover Friend (2024) Sub Indo",
      "slug": "you-are-my-lover-friend"
    },
    {
      "title": "Nonton Drama You Are My Lover Friend (2024) Sub Indo",
      "slug": "you-are-my-lover-friend",
      "img": "https://drama-id.com/wp-content/uploads/2026/01/You-Are-My-Lover-Friend-AkA.webp"
    },
    {
      "title": "Nonton Drama Please Remember Me (2024) Sub Indo",
      "slug": "please-remember-me"
    },
    {
      "title": "Nonton Drama Please Remember Me (2024) Sub Indo",
      "slug": "please-remember-me",
      "img": "https://drama-id.com/wp-content/uploads/2026/01/Please-Remember-Me-Oa4.webp"
    },
    {
      "title": "Nonton Drama No One but You (2024) Sub Indo",
      "slug": "no-one-but-you"
    },
    {
      "title": "Nonton Drama No One but You (2024) Sub Indo",
      "slug": "no-one-but-you",
      "img": "https://drama-id.com/wp-content/uploads/2025/12/No-One-but-You-F5m.webp"
    },
    {
      "title": "Nonton Drama Their Wonderful Time (2024) Sub Indo",
      "slug": "their-wonderful-time"
    },
    {
      "title": "Nonton Drama Their Wonderful Time (2024) Sub Indo",
      "slug": "their-wonderful-time",
      "img": "https://drama-id.com/wp-content/uploads/2025/12/Their-Wonderful-Time-kBF.webp"
    },
    {
      "title": "Nonton Drama The First Shot (2024) Sub Indo",
      "slug": "the-first-shot"
    },
    {
      "title": "Nonton Drama The First Shot (2024) Sub Indo",
      "slug": "the-first-shot",
      "img": "https://drama-id.com/wp-content/uploads/2025/12/The-First-Shot-8YV.webp"
    },
    {
      "title": "Nonton Drakor Surely Tomorrow (2025) Sub Indo",
      "slug": "surely-tomorrow"
    },
    {
      "title": "Nonton Drakor Surely Tomorrow (2025) Sub Indo",
      "slug": "surely-tomorrow",
      "img": "https://drama-id.com/wp-content/uploads/2025/12/Surely-Tomorrow-8Mv.webp"
    }
  ]
}

**Title object (example):**
```json
{
  "id": "kdr-12345",
  "slug": "my-perfect-stranger",
  "name": "My Perfect Stranger",
  "posterUrl": "https://cdn.example.com/posters/kdr-12345.jpg",
  "year": 2023,
  "country": "KR",
  "genres": ["Mystery", "Romance"],
  "rating": 8.4,
  "episodes": 16,
  "synopsis": "...",
  "cast": ["Actor A", "Actor B"],
  "crew": ["Director C"],
  "availability": { "regions": ["ID"], "subtitles": ["ID", "EN"] }
}
```

---

## 6) SEO & Metadata (Drakor)
- Unique `<title>` and meta description for `/drakor`.
- Canonical URLs under `/drakor/*`.
- Open Graph/Twitter Cards; JSON‑LD (`TVSeries`/`VideoObject`) where applicable.
- Include `/drakor` in `robots.txt` and sitemap generation.

---

## 7) Analytics Events (examples)
- `mode_popup_impression`
- `mode_popup_select` { mode }
- `mode_switcher_select` { from, to }
- `drakor_home_impression`
- `drakor_title_impression` { title_id }
- `drakor_play_click` { title_id, episode }

---

## 8) Accessibility (a11y)
- Keyboard navigation, focus trap inside dialog, ESC close.
- Visible focus styles; screen reader labels.

---

## 9) Performance
- Lazy‑load Drakor UI when navigated.
- `prefetch('/drakor')` on Mode switcher hover.
- Cache/stale‑while‑revalidate for Drakor home API.

---

## 10) Feature Flags (Cloudflare Env)
- `DRAKOR_ENABLED` — gates `/drakor` visibility & redirects.
- `MODE_POPUP_ENABLED` — gates popup rendering on `/`.

---

## 11) Testing Plan
- **Unit**: preference util, popup behavior, cookies logic.
- **E2E**: first‑visit flow, returning visitor redirect, switcher, `/drakor` SEO tags.
- **Cross‑browser**: Chrome, Safari, Firefox, Android WebView, iOS WKWebView.
- **Accessibility**: NVDA/VoiceOver smoke tests.
- **Perf**: Lighthouse ≥ 90 on `/drakor`.

---

## 12) Acceptance Criteria (AC)
1. First‑time visitor on `/` sees popup; selecting persists preference and routes correctly.
2. Returning visitor lands directly on chosen mode with no flicker.
3. Header switcher toggles modes and updates persistence.
4. `/drakor` renders with unique SEO and data from Drakor API.
5. No regressions to existing Dracin homepage.

---

## 13) Implementation Notes (SvelteKit + Tailwind)

### 13.1 Preference Utilities
**`src/lib/modePreference.ts`**
```ts
export type ContentMode = 'dracin' | 'drakor';
const KEY = 'contentMode';

export function getClientMode(): ContentMode | null {
  if (typeof window === 'undefined') return null;
  return (window.localStorage.getItem(KEY) as ContentMode) || null;
}

export function setClientMode(mode: ContentMode) {
  if (typeof document === 'undefined') return;
  window.localStorage.setItem(KEY, mode);
  document.cookie = `contentMode=${mode}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
```

### 13.2 Server‑Side Redirect on Root
**`src/hooks.server.ts`**
```ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const mode = event.cookies.get('contentMode');
  const drakorEnabled = event.platform?.env?.DRAKOR_ENABLED === 'true';

  if (drakorEnabled && event.url.pathname === '/' && mode === 'drakor') {
    return Response.redirect(new URL('/drakor', event.url), 307);
  }
  return resolve(event);
};
```

### 13.3 Inject Popup on Existing Home (Dracin)
**`src/routes/+page.server.ts`** (pass flags to client)
```ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
  return {
    flags: { modePopupEnabled: platform?.env?.MODE_POPUP_ENABLED !== 'false' }
  };
};
```

**`src/routes/+page.svelte`** (existing Dracin home; append popup)
```svelte
<script lang="ts">
  import ModePopup from '$lib/components/ModePopup.svelte';
  export let data: { flags: { modePopupEnabled: boolean } };
</script>

<!-- Existing Dracin homepage content remains unchanged above -->
<ModePopup enabled={data.flags.modePopupEnabled} />
```

### 13.4 Popup Component (Accessible)
**`src/lib/components/ModePopup.svelte`**
```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { getClientMode, setClientMode } from '$lib/modePreference';
  import { goto, prefetch } from '$app/navigation';
  import { page } from '$app/stores';
  import { get } from 'svelte/store';

  export let enabled = true;
  let open = false;

  onMount(() => {
    if (!enabled) return;
    const pref = getClientMode();
    if (!pref && get(page).url.pathname === '/') {
      open = true;
      // warm up drakor route for faster first switch
      prefetch('/drakor').catch(() => {});
    }
  });

  function select(mode: 'dracin' | 'drakor') {
    setClientMode(mode);
    open = false;
    if (mode === 'drakor') goto('/drakor');
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') open = false;
  }
</script>

{#if open}
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-labelledby="mode-title" on:keydown={onKeydown}>
  <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl outline-none" tabindex="-1">
    <h2 id="mode-title" class="mb-4 text-xl font-bold">Choose your content mode</h2>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <button class="rounded border p-4 text-left hover:border-blue-500 focus:outline-none focus:ring" on:click={() => select('dracin')}>
        <div class="text-lg font-semibold">Dracin</div>
        <div class="text-sm text-gray-600">Short Drama China Viral</div>
      </button>
      <button class="rounded border p-4 text-left hover:border-blue-500 focus:outline-none focus:ring" on:click={() => select('drakor')}>
        <div class="text-lg font-semibold">Drakor</div>
        <div class="text-sm text-gray-600">Drama Korea Terbaru</div>
      </button>
    </div>
    <button class="mt-4 text-sm text-gray-500" on:click={() => (open = false)}>Close</button>
  </div>
</div>
{/if}
```

### 13.5 Header Mode Switcher
**`src/lib/components/ModeSwitcher.svelte`**
```svelte
<script lang="ts">
  import { goto, prefetch } from '$app/navigation';
  import { setClientMode } from '$lib/modePreference';

  function to(mode: 'dracin' | 'drakor') {
    setClientMode(mode);
    goto(mode === 'dracin' ? '/' : '/drakor');
  }
</script>

<div class="inline-flex rounded border p-1 text-sm">
  <button class="px-3 py-1" on:mouseenter={() => prefetch('/')} on:click={() => to('dracin')}>Dracin</button>
  <button class="px-3 py-1" on:mouseenter={() => prefetch('/drakor')} on:click={() => to('drakor')}>Drakor</button>
</div>
```

*(Mount **ModeSwitcher** in your global header layout so it’s always visible.)*

### 13.6 Drakor Homepage (Server Load + Page)
**`src/routes/drakor/+page.server.ts`**
```ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, platform }) => {
  const enabled = platform?.env?.DRAKOR_ENABLED === 'true';
  if (!enabled) return { disabled: true };

  const api = platform?.env?.API_BASE_URL;
  if (!api) throw new Error('API_BASE_URL is not configured');

  const res = await fetch(`${api}/api/drakor/home`, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('Failed to load Drakor home');

  const data = await res.json();
  return { data };
};
```

**`src/routes/drakor/+page.svelte`**
```svelte
<script lang="ts">
  export let data: { disabled?: boolean; data?: any };
</script>

<svelte:head>
  <title>Drakor — Drama Korea Terbaru</title>
  <meta name="description" content="Explore trending and latest K‑Drama titles" />
  <meta property="og:title" content="Drakor" />
  <meta property="og:description" content="Drama Korea Terbaru" />
  <meta property="og:type" content="website" />
  <!-- Optional structured data JSON-LD (update with real values) -->
  <script type="application/ld+json">{JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Drakor — Drama Korea Terbaru"
  })}</script>
</svelte:head>

{#if data?.disabled}
  <div class="p-6 text-gray-600">Drakor is not available right now.</div>
{:else}
  <main class="space-y-8 p-4 sm:p-6">
    <section>
      <h1 class="text-2xl font-bold">Trending</h1>
      <!-- render cards from data.data.trending -->
    </section>
    <section>
      <h2 class="text-xl font-semibold">New Releases</h2>
      <!-- render from data.data.newReleases -->
    </section>
    <section>
      <h2 class="text-xl font-semibold">Top Rated</h2>
      <!-- render from data.data.topRated -->
    </section>
    <section>
      <h2 class="text-xl font-semibold">Genres</h2>
      <!-- render from data.data.genres -->
    </section>
  </main>
{/if}
```

### 13.7 Analytics Hook (placeholder)
**`src/lib/analytics.ts`**
```ts
export function track(event: string, payload?: Record<string, unknown>) {
  // TODO: wire to your analytics SDK
  console.debug('[analytics]', event, payload);
}
```

Example usage inside Popup:
```svelte
// on open
// track('mode_popup_impression');
// on select
// track('mode_popup_select', { mode });
```

### 13.8 Cloudflare Adapter & Config
**`svelte.config.js`**
```js
import adapter from '@sveltejs/adapter-cloudflare';
import preprocess from 'svelte-preprocess';

const config = {
  preprocess: preprocess(),
  kit: {
    adapter: adapter(),
    alias: { $lib: 'src/lib' }
  }
};

export default config;
```

**`wrangler.toml`** (adjust `compatibility_date` and API URL)
```toml
name = "dracinku"
main = "./.svelte-kit/cloudflare/_worker.js"
compatibility_date = "2025-10-01"

[vars]
API_BASE_URL = "https://api.example.com"
DRAKOR_ENABLED = "true"
MODE_POPUP_ENABLED = "true"
```

> **Note:** In SvelteKit on Cloudflare Workers, env vars are available via `event.platform?.env`. For any client‑side flags, pass them from a server `load()` as shown (do **not** rely on build‑time `PUBLIC_*` for runtime toggles).

### 13.9 Tailwind Setup Reminder
Ensure Tailwind is configured (if not already) and classes purged for production. No changes needed if your Dracin is already Tailwind‑ready.

---

## 14) Environment Variables
- `API_BASE_URL` — base URL for Drakor endpoints (GET).
- `DRAKOR_ENABLED` — `"true" | "false"`.
- `MODE_POPUP_ENABLED` — `"true" | "false"`.

---

## 15) Deliverables
- Popup component + header mode switcher.
- `/drakor` route with server data loading, sections, and SEO.
- Server hook redirect based on `contentMode` cookie.
- API integration for Drakor.
- Tests (unit + E2E), basic a11y checks, Lighthouse report.
- Wrangler config & deployment notes.

---

## 16) Rollout Plan
1. Ship behind flags to staging; mark staging as noindex.
2. Canary enable `DRAKOR_ENABLED` for a small % (or specific region) if desired.
3. Monitor errors, engagement, and performance.
4. Ramp to 100%; post‑launch SEO crawl & analytics verification.

---

## 17) Edge Cases
- Cookies/localStorage blocked → show popup each visit; proceed without persistence.
- Deep link to `/drakor/*` with no preference → render Drakor; set preference to `drakor` upon visit.
- Back button loops avoided by server‑side redirect only on `/`.

---

## 18) Definition of Done
- All ACs met; no P0/P1; Lighthouse ≥ 90 on `/drakor`; a11y checks pass; product sign‑off.

