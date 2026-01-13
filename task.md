# Task: Add API Backup 1 & Deploy (Local Redeploy)

- [x] **Add API Backup 1 Configuration**
  - [x] Update `src/lib/config/apis.config.ts`
  - [x] Update `telegram-bot-worker/src/config.ts`
- [x] **Response Normalizer**
  - [x] Handle string `playCount`
  - [x] Map `corner` object
  - [x] Handle nested `data.data.list`
- [x] **Update API Service**
  - [x] Implement `getList` helper
  - [x] Add automatic fallback mechanism
- [x] **Local Redeploy**
  - [x] Build application (`npm run build`)
  - [x] Deploy to Cloudflare Pages (`npx wrangler pages deploy`)
  - [x] Deploy Telegram Bot Worker (`npm run deploy`)