# FitCalory — Developer Guide

## Project Overview
MERN PWA app for AI-powered food calorie tracking using Claude Vision API.

## Stack
- **Frontend**: React 19 + TypeScript, Vite 6, React Query 5, React Router 7, Zustand, TailwindCSS 4
- **Backend**: Express 4 + TypeScript, MongoDB/Mongoose, JWT, Google OAuth
- **AI**: Anthropic Claude API (claude-opus-4-5 vision)
- **PWA**: vite-plugin-pwa + Workbox

## Setup

### 1. Environment
Copy `.env.example` → `.env` and fill in:
- `MONGODB_URI` — your MongoDB connection string
- `ANTHROPIC_API_KEY` — from console.anthropic.com
- `GOOGLE_CLIENT_ID` — from Google Cloud Console (optional)

### 2. Install & Run
```bash
npm run install:all   # installs root + server + client deps
npm run dev           # starts both server (5000) + client (5173)
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
- `server/src/modules/ai/ai.service.ts` — Claude Vision integration
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
