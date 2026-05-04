# FitCalory — Developer Guide

## Project Overview
MERN PWA app for AI-powered food calorie tracking using Google Gemini Vision API.

## Stack
- **Frontend**: React 19 + TypeScript, Vite 6, React Query 5, React Router 7, Zustand, TailwindCSS 4
- **Backend**: Express 4 + TypeScript, MongoDB/Mongoose, JWT, Google OAuth
- **AI**: Google Gemini API (gemini-2.5-flash vision)
- **PWA**: vite-plugin-pwa + Workbox

## Setup

### 1. Environment
Copy `.env.example` → `.env` and fill in:
- `MONGODB_URI` — your MongoDB connection string
- `GEMINI_API_KEY` — from aistudio.google.com (free)
- `GOOGLE_CLIENT_ID` — from Google Cloud Console (optional)

### 2. Install & Run
```bash
yarn install      # installs all workspaces (root + client + server)
yarn dev          # starts both server (5000) + client (5173)
```

### Package manager
This project uses **Yarn Classic (v1)** with workspaces. Never use `npm` — always use `yarn`.

```bash
# Run scripts in a specific workspace
yarn workspace client <script>
yarn workspace server <script>

# Add a dependency to a workspace
yarn workspace client add <package>
yarn workspace server add --dev <package>
```

## Architecture

### API Hook Chain (follow D:\avatar pattern)
```
Feature page hook (e.g., useDashboard.ts)
  → useGetAll / useGetOne / useMutate (shared/hooks/api/)
    → useApi (shared/hooks/api/useApi.ts)
      → request.ts (axios + auth interceptor)
        → Express /api/v1/...
```

### Feature Module Structure
```
src/pages/FeatureName/
├── Page.tsx           # Route component
├── components/        # Feature-specific UI
└── hooks/             # Data + business logic hooks
```

### Naming Conventions
- Folders: `kebab-case`
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Interfaces: `NameInterface.ts`
- Enums: `Name.enum.ts` (UPPER_SNAKE_VALUE)
- Query keys: `QUERY_KEYS.UPPER_SNAKE` in `shared/constants/queryKeys.ts`

## Key Files
- `client/src/request.ts` — axios instance, token refresh logic
- `client/src/shared/store/useAuthStore.ts` — JWT tokens (persisted)
- `server/src/modules/ai/ai.service.ts` — Gemini Vision integration
- `server/src/config/env.ts` — env validation with Zod

## API Endpoints
- `POST /api/v1/auth/register|login|google|refresh|logout`
- `GET|PUT /api/v1/users/me`
- `GET /api/v1/users/me/tdee`
- `GET|POST|PUT|DELETE /api/v1/meals`
- `GET /api/v1/meals/stats/daily?date=YYYY-MM-DD`
- `GET /api/v1/meals/stats/weekly?startDate=YYYY-MM-DD`
- `POST /api/v1/ai/analyze` (multipart/form-data, field: `image`)
- `GET /api/v1/water/:date`
- `POST /api/v1/water`

## PWA
Icons needed at `client/public/icons/icon-192x192.png` and `icon-512x512.png`.
Generate with any icon generator (e.g., realfavicongenerator.net).

## Deployment (VPS + Nginx + PM2)

### First-time server setup
```bash
# 1. Install Node 20, Yarn, PM2, Nginx on VPS (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx
sudo npm install -g yarn pm2

# 2. Clone repo and install dependencies
git clone <repo-url> /var/www/fit-calory
cd /var/www/fit-calory
yarn install

# 3. Configure environment
cp .env.example .env
nano .env
# Set: NODE_ENV=production, CLIENT_URL=https://yourdomain.com
# Fill: MONGODB_URI, JWT secrets (openssl rand -hex 64), GEMINI_API_KEY

# 4. Build both workspaces
yarn build      # → server/dist/ + client/dist/

# 5. Set up Nginx
sudo cp nginx/nginx.conf /etc/nginx/sites-available/fit-calory
sudo sed -i 's/DOMAIN/yourdomain.com/g' /etc/nginx/sites-available/fit-calory
sudo ln -s /etc/nginx/sites-available/fit-calory /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 6. Get SSL certificate (Certbot auto-configures Nginx)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 7. Start app with PM2
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup     # run the printed command to enable auto-start on reboot

# 8. Create log directory (PM2 will write here)
mkdir -p /var/www/fit-calory/logs
```

### Deploy updates
```bash
git pull
yarn install
yarn build
pm2 restart fit-calory
```

### Useful PM2 commands
```bash
pm2 status                  # check process status
pm2 logs fit-calory         # stream logs
pm2 restart fit-calory      # restart after code change
pm2 stop fit-calory         # stop the process
```
