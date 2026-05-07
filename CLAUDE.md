# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
MERN PWA app for AI-powered food calorie tracking using Google Gemini Vision API. UI language is Uzbek.

## Stack
- **Frontend**: React 19 + TypeScript, Vite 6, React Query 5, React Router 7, Zustand, TailwindCSS 4
- **Backend**: Express 4 + TypeScript, MongoDB/Mongoose, JWT, Google OAuth
- **AI**: Google Gemini API (`gemini-2.5-flash` — vision + chat)
- **PWA**: vite-plugin-pwa + Workbox

## Commands

```bash
yarn install               # install all workspaces
yarn dev                   # server (PORT env, default 5000) + client (5173) concurrently
yarn build                 # tsc + vite build → server/dist/ + client/dist/
yarn lint                  # eslint both workspaces
yarn lint:fix              # eslint --fix both workspaces

# Workspace-specific
yarn workspace client dev
yarn workspace server dev
yarn workspace client add <pkg>
yarn workspace server add <pkg>
```

**Package manager**: Yarn Classic (v1) with workspaces. Never use `npm`.

Commits are enforced via commitlint + husky — follow Conventional Commits (`feat:`, `fix:`, `chore:`, etc.).

## Architecture

### API Hook Chain
```
Feature page hook (e.g., useDashboard.ts)
  → useGetAll / useGetOne / useMutate  (client/src/shared/hooks/api/)
    → useApi  (builds typed get/mutate/remove wrappers)
      → request.ts  (axios instance, bearer token + auto-refresh)
        → Express /api/v1/...
```

All server responses use the envelope `{ success: boolean, message: string, data: T }`.  
`useApi.get` / `useApi.mutate` unwrap `data.data` automatically, so hooks receive `T` directly.

### Feature Module Structure

**Client** (`client/src/pages/<FeatureName>/`):
```
Page.tsx           # route component, minimal JSX — delegates to hooks
components/        # feature-specific UI
hooks/             # data + business logic (React Query)
```

**Server** (`server/src/modules/<name>/`):
```
<name>.model.ts     # Mongoose schema + interface
<name>.dto.ts       # Zod-validated request shapes
<name>.service.ts   # business logic (no req/res)
<name>.controller.ts
<name>.route.ts
```

### Auth Flow
- JWT: 15-minute access token + 30-day refresh token
- Tokens stored in Zustand (`useAuthStore`) with `persist` middleware (localStorage key `auth-store`) and mirrored in a `refreshToken` cookie
- `request.ts` interceptor retries once on 401 by calling `/auth/refresh`, then redirects to `/login` on failure
- Google Auth handles both ID tokens (default) and access tokens (prefix `ya29.`) for mobile OAuth compatibility

### AI Module
- `POST /api/v1/ai/analyze` — multipart/form-data, field `images` (multiple allowed) + optional `note` text
- If images present → `analyzeFoodImages()` (Gemini Vision, base64 inline data); if text only → `analyzeFoodText()` (Gemini text)
- Uploaded files stored in `server/uploads/` (not in git), served at `/uploads/` via Express static + Nginx proxy
- Supported MIME types: jpeg, png, webp, heic (heic remapped to `image/jpeg` for Gemini)
- Rate limit: 5 AI requests per 15 minutes per IP

### Chat Module
- `POST /api/v1/chat` sends a message; response returns both `{ userMsg, aiMsg }` saved to MongoDB
- `GET /api/v1/chat?before=<msgId>&limit=20` — cursor-based pagination (newest first from DB, reversed for display)
- Client uses `useInfiniteQuery` with an IntersectionObserver sentinel at the top to load older messages
- Gemini chat uses `model.startChat({ history })` with last 10 messages as context + a system prompt containing the user's macros and dietary preferences
- Rate limit: 30 chat requests per minute per IP

### Naming Conventions
- Folders: `kebab-case`
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Interfaces: `NameInterface.ts`
- Enums: `Name.enum.ts` (UPPER_SNAKE_VALUE)
- Query keys: `QUERY_KEYS.UPPER_SNAKE` in `client/src/shared/constants/queryKeys.ts`

## Key Files
- `client/src/request.ts` — axios instance, token refresh interceptor
- `client/src/shared/store/useAuthStore.ts` — JWT tokens (persisted to localStorage + cookie)
- `client/src/shared/utils/config.ts` — `apiUrl: "/api/v1"` (all API calls are relative; Vite proxies to server in dev)
- `server/src/modules/ai/ai.service.ts` — Gemini Vision + text analysis + chat
- `server/src/config/env.ts` — Zod-validated env; process exits on missing required vars
- `server/src/config/multer.ts` — disk storage to `server/uploads/`, 10 MB limit

## API Endpoints
- `POST /api/v1/auth/register|login|google|refresh|logout`
- `GET|PUT /api/v1/users/me`
- `GET /api/v1/users/me/tdee`
- `GET|POST|PUT|DELETE /api/v1/meals`
- `GET /api/v1/meals/stats/daily?date=YYYY-MM-DD`
- `GET /api/v1/meals/stats/weekly?startDate=YYYY-MM-DD`
- `POST /api/v1/ai/analyze` (multipart/form-data, field: `images`)
- `GET|POST /api/v1/chat`
- `GET /api/v1/water/:date`
- `POST /api/v1/water`
- `GET /api/v1/health`

## Environment Variables (`.env` at repo root)
Required: `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `GEMINI_API_KEY`  
Optional: `GOOGLE_CLIENT_ID`, `PORT` (default 5000), `CLIENT_URL` (default `http://localhost:5173`)

## Deployment (VPS + Nginx + PM2)

### First-time server setup
```bash
# 1. Install Node 20, Yarn, PM2, Nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx
sudo npm install -g yarn pm2

# 2. Clone and install
git clone <repo-url> /var/www/fit-calory
cd /var/www/fit-calory && yarn install

# 3. Configure environment
cp .env.example .env
# Set: NODE_ENV=production, PORT=5005, CLIENT_URL=https://yourdomain.com
# Fill: MONGODB_URI, JWT secrets (openssl rand -hex 64), GEMINI_API_KEY

# 4. Build
yarn build   # → server/dist/ + client/dist/

# 5. Set up Nginx (proxies /api/ and /uploads/ to port 5005)
sudo cp nginx/nginx.conf /etc/nginx/sites-available/fit-calory
sudo sed -i 's/DOMAIN/yourdomain.com/g' /etc/nginx/sites-available/fit-calory
sudo ln -s /etc/nginx/sites-available/fit-calory /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 6. SSL
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 7. Start with PM2
mkdir -p /var/www/fit-calory/logs
pm2 start ecosystem.config.cjs --env production
pm2 save && pm2 startup   # run the printed command
```

### Deploy updates
```bash
git pull && yarn install && yarn build && pm2 restart fit-calory
```

> **Note**: Nginx proxies to port **5005** in production. Set `PORT=5005` in `.env` on the server.
