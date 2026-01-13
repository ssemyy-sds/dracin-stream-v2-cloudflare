# Migration Plan: Dracin Stream V2 to Cloudflare Pages

## Goal Description
Migrate the existing SvelteKit application (`Dracin Stream V2`) from Vercel to **Cloudflare Pages**. This leverages Cloudflare's global edge network for faster loading times and unlimited bandwidth.

**Technology Selection:**
We will stick with **SvelteKit** as the framework.
- **Why?** The app is already built in SvelteKit and supports Cloudflare Pages via `@sveltejs/adapter-cloudflare`.
- **Benefit:** Direct integration.
- **Deployment Method:** Direct upload via **Wrangler CLI** (running inside a Docker container) using an API Token. This avoids local Node.js/npm dependencies and GitHub Actions.

## Proposed Changes

### Core Configuration
#### [MODIFY] [svelte.config.js](file:///c:/Users/suryanata/Project/dracin-stream-v2-claudflare/svelte.config.js)
- Swap `adapter-auto` (or `adapter-vercel`) for `@sveltejs/adapter-cloudflare`.

#### [MODIFY] [package.json](file:///c:/Users/suryanata/Project/dracin-stream-v2-claudflare/package.json)
- Uninstall `@sveltejs/adapter-auto`.
- Install `@sveltejs/adapter-cloudflare`.

#### [NEW] [wrangler.toml](file:///c:/Users/suryanata/Project/dracin-stream-v2-claudflare/wrangler.toml)
- Configuration file for Cloudflare Workers/Pages.
- Define compatibility dates and smart placement options.

### Deployment Setup
#### [NEW] [Deploy with Docker](file:///c:/Users/suryanata/Project/dracin-stream-v2-claudflare/deploy-cloudflare.ps1)
- Create a PowerShell script to run the build and deploy process using Docker.
- **Docker Image:** `node:18` or `node:20` (slim).
- **Steps:**
    1.  Mount current directory.
    2.  `npm install`.
    3.  `npm run build`.
    4.  `npx wrangler pages deploy .svelte-kit/cloudflare --project-name dracinku --branch main` (using CLOUDFLARE_API_TOKEN).

## Verification Plan

### Deployment Verification
1.  Run the docker deployment script: `.\deploy-cloudflare.ps1`
2.  Input the Cloudflare API Token when prompted (or strictly via env var).
3.  Access `https://dracinku.pages.dev` to verify functionality.