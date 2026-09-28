# PINK — backend/database alignment

## Done
- [x] Read the cloned backend and catalogued its broken parts
- [x] Database schema ready as `db/001_init.sql` (profiles, connector catalogue incl. Telegram,
      MCP connections with stdio/SSE/HTTP fields, conversations, messages, tasks, task logs,
      usage, API keys, invoices, notification prefs, RLS + grants, signup trigger, realtime)
- [x] Supabase client (`src/integrations/supabase/client.ts`) + `.env`
- [x] Shared data types (`src/lib/types.ts`)
- [x] Static product content split out of mock data (`src/lib/content.ts`)
- [x] Agent backend API client (`src/lib/api.ts`)

## Remaining
- [ ] Data hooks (`src/lib/queries.ts`) and auth hook, then rewrite the 20 route/component files
      that still import `src/lib/mock.ts`, and delete `src/lib/mock.ts`
- [ ] Connector detail/config UI: transport picker (stdio / SSE / streamable HTTP), server URL,
      auth header + token, tool count after handshake
- [ ] Corrected backend files to copy into the PINK-AI_agent repo:
      - `app/connectors/manager.py` — add SSE + streamable HTTP transports, per-user server
        URL/token from `mcp_connections` (currently stdio only)
      - `app/core/agent_runtime.py` — tool-name parsing assumes a `__` delimiter
      - `app/api/routes_chat.py` — persist conversations/messages/tasks
      - `app/main.py` — add CORS
      - `app/queue/tasks.py` — soft time limit (100) exceeds hard limit (120) incorrectly paired
      - `app/core/router.py` — unused `call_tier_fn` parameter
- [ ] Run the SQL in the Supabase SQL editor (blocked: this project uses an external
      Supabase project, so migrations cannot be applied from here)

## DirectionalTrendEA reporting
- [x] Public page /ea/directional-trend-ea, /app/ea/dashboard, /app/ea/dashboard/$accountId, /app/ea/authorize-account, /app/ea/billing
- [x] Reorganize EA navigation: public service presentation; signed-in documentation, authorization, releases, dashboard, and billing
- [x] Add structured EA releases: version history, current release details, notes, file metadata, and controlled publishing workflow
- [ ] Run `db/008_ea_reporting.sql` in Supabase (blocked: external Supabase project)
- [ ] Fill placeholders: functions base URL, anon key, support email, FAQ answers (blocked: owner input)

## Shared navigation
- [x] Centralize public and signed-in menus in shared layouts and keep long menus independently scrollable
