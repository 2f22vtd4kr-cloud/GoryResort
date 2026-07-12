---
name: Gemini + Simulator setup
description: Model selection, API key config, and simulator route details for the GORY resort AI simulator backend.
---

## Working model

`gemini-flash-latest` — the only model that works with this API key.

**Why:** `gemini-2.5-flash` is deprecated ("no longer available to new users"). `gemini-2.0-flash`, `gemini-2.0-flash-lite`, `gemini-1.5-flash`, `gemini-2.5-flash-lite` all return 429 with `limit: 0` (free-tier quota exhausted) or 404. `gemini-flash-latest` returns 200.

**How to apply:** Both `artifacts/api-server/src/routes/simulate.ts` and `artifacts/api-server/src/routes/improve.ts` must use `model: "gemini-flash-latest"`. If this model starts failing, test alternatives with the models list endpoint before changing.

## API key

User provides their own `GEMINI_API_KEY` stored as a Replit Secret.

## Simulator endpoints

- `POST /api/simulate` — runs one persona (investor | skier | tourist), returns `SimulateResult` with per-section scores, overall verdict, and Russian translation issues
- `POST /api/improve` — takes array of SimulateResult objects, returns ranked `ImprovementResult` with exact copy to add to the site
- `GET /api/healthz` — health check

## Frontend

- Simulator page at `/simulator` route in `artifacts/gory-resort/src/components/SimulatorPage.tsx`
- Calls `apiBase + /api/simulate` and `apiBase + /api/improve`; `apiBase = ''` so Vite dev proxy routes `/api → localhost:8080`
