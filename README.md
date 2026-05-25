# KalviThozhan

Tamil Nadu Government School LMS platform for Kalvi TV videos, Samacheer notes, student dashboards, authentication, profiles, feedback, and basic LMS workflows.

## Project Structure

```txt
/frontend
  /src
    /app
    /components
    /features
    /hooks
    /layouts
    /lib
    /routes
    /services
    /store
    /styles
    /types
    /utils
  /public
  .env.local
  package.json

/backend
  /src
    /config
    /controllers
    /middlewares
    /repositories
    /routes
    /services
    /utils
    /validators
  /supabase
  .env
  package.json
  server.js

README.md
```

Note: the existing frontend codebase is TanStack Start/Vite, not Next.js. The structure now keeps the requested production boundaries while preserving the current working application instead of rewriting routes and package dependencies.

## Files Moved

- Root frontend build files moved into `frontend/`: `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `eslint.config.js`, `components.json`, Prettier config, and `.gitignore`.
- Root `.env` moved to `frontend/.env.local`.
- Root `supabase/` moved to `backend/supabase/`.
- Root `database/*.sql` moved into `backend/supabase/`.
- Frontend Supabase client code stays in `frontend/src/integrations/supabase/*`.
- Frontend global styles stay in `frontend/src/styles.css`.
- Frontend assets stay in `frontend/src/assets/*`.

## Files Removed

- Duplicate local docs: `frontend/README.md`, `backend/README.md`.
- AI/generated or unused root clutter: `.lovable/`, `bun.lock`, `bunfig.toml`, `wrangler.jsonc`.
- Empty legacy folders after moves: `database/`.

## Naming Cleanup

- Frontend package renamed from `tanstack_start_ts` to `kalvi-thozhan-frontend`.
- New backend package named `kalvi-thozhan-backend`.
- Supabase imports use `@/integrations/supabase/...`.
- Global CSS import uses `src/styles.css`.
- New backend route file follows kebab-case: `health.routes.js`.

## Architecture Boundaries

- `frontend/src/components`: reusable UI and shared visual components.
- `frontend/src/features`: feature-specific UI and logic when features are extracted from routes.
- `frontend/src/integrations/supabase`: Supabase client, server client, auth middleware, and generated types.
- `frontend/src/services`: frontend API/data service wrappers.
- `frontend/src/styles`: global CSS and Tailwind styles.
- `backend/src/routes`: Express route definitions.
- `backend/src/controllers`: request handlers when API behavior grows beyond simple routes.
- `backend/src/services`: backend business logic.
- `backend/src/repositories`: Supabase/database access wrappers.
- `backend/src/config`: environment and runtime configuration.

## Commands

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
npm install
npm run dev
```

## Supabase Setup

1. Open the Supabase SQL editor for `https://dgrtixahrbesogmtwxai.supabase.co`.
2. Run `backend/supabase/schema.sql`.
3. Run `backend/supabase/policies.sql`.
4. Run `backend/supabase/seed.sql` to insert starter schools, materials, videos, events, and notifications.
5. Copy `backend/.env.example` to `backend/.env` and set `SUPABASE_SERVICE_ROLE_KEY` from Supabase Project Settings > API.

Backend API routes:

```txt
GET  /health
GET  /health/db
GET  /api/schools
GET  /api/materials?class=10
GET  /api/videos?class=10&subject=Science
GET  /api/events?district=Madurai
GET  /api/notifications
POST /api/feedback
```
