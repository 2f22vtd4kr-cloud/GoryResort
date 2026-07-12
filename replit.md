# GORY Mountain Resort

A resort landing page for GORY Mountain Resort (Caucasus, opening 2027). Visitor-persona review (Investor / Skier / Traveller / Dev-Designer-Owner) is done by the agent directly — reasoning through each persona and writing content patches straight into the codebase. There is no automated LLM API pipeline for this; it was removed as dead weight.

## Run & Operate

- Workflows are configured in Replit: **artifacts/gory-resort: web** (frontend, Vite, port 5000) and **artifacts/api-server: API Server** (Express 5, port 8080)
- `pnpm --filter @workspace/api-server run dev` — run the API server manually
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `DATABASE_URL` — Postgres connection string (runtime-managed by Replit, available automatically)
- Persona review process: the agent reads the live site, reasons through each persona's critique, and writes the resulting copy patches directly into `artifacts/gory-resort/src/contexts/ai-content.ts` (imported by `LanguageContext.tsx`) — see the `aiRunMeta` entry in that file for the latest pass. No API key or external LLM call is involved.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- **React 19 + `flushSync`**: `flushSync(() => { createRoot.render() })` silently fails to commit in React 19 — `#root` stays empty, all sections invisible. Use plain `root.render(<App />)` (already fixed in `main.tsx`). Never re-introduce `flushSync` for the initial render.
- **Screenshot tool**: Always captures before React's async render commits (React 19 uses macrotask scheduling). Screenshots show only the `#root:empty` CSS loading state (mountain hero). To screenshot below-fold sections, a server-side rendering or puppeteer approach with explicit wait is needed.
- **`#root:empty` CSS**: `index.html` has a CSS loading state (`background-image: url('/images/hero.jpg')`, `min-height: 100dvh`) that mimics the Hero while React hydrates. This is intentional — do not remove it.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
