---
name: Gemini + User Simulator
description: Architecture of the AI-powered user simulator for GORY resort site
---

# Gemini + User Simulator

## Setup
- User provided their own `GEMINI_API_KEY` secret (not Replit AI Integrations — they declined the upgrade)
- Package: `@google/genai` installed in `artifacts/api-server`
- Client: `new GoogleGenAI({ apiKey: process.env["GEMINI_API_KEY"] })`
- Model used: `gemini-2.5-flash` with `responseMimeType: "application/json"`

## API Route
- `POST /api/simulate` in `artifacts/api-server/src/routes/simulate.ts`
- Accepts `{ persona: "investor" | "skier" | "tourist" }`
- Site content is hardcoded in the route (static marketing site, no DB needed)
- Returns: sections[], overall verdict, translationIssues[]
- Mounted in `artifacts/api-server/src/routes/index.ts`

## Frontend
- SimulatorPage at `/simulator` route via Wouter (App.tsx uses `<Router base={import.meta.env.BASE_URL.replace(/\/$/, '')}>`)
- Floating "◎ Simulator" button on main site links to `/simulator`
- Direct fetch to `/api-server/api/simulate` — no generated client hook

**Why:** The Replit AI Integration required account upgrade; direct SDK approach with user's key is the fallback per skill instructions.

**How to apply:** If extending AI features on this project, use the same GoogleGenAI pattern. Do NOT call setupReplitAIIntegrations again without checking if user has upgraded.
