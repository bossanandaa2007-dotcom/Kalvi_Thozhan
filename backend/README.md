# Backend

Backend-ready structure for the prototype:

- `routes`
- `controllers`
- `middleware`
- `models`
- `services`
- `utils`

The running prototype uses Supabase for authentication, data access, realtime activity, and storage-facing operations. Server entry and auth middleware currently live in `../src/server.ts` and `../src/integrations/supabase`.
