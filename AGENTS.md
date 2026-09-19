# AGENTS.md

Repository guide for coding agents such as Codex and Claude Code.

## Quick start

- Runtime: Node.js 20+
- Install: `npm install`
- Type-check: `npm run check`
- Build: `npm run build`
- Dev server: `npm run dev`
- Regenerate static data after dataset edits: `npm run generate:data`

## What is actually deployed

- Production currently serves the repository-root `index.html` plus `incidents.json`.
- The React app in `client/` is real and builds, but it is not the production artifact today.
- `server/` contains an Express backend that is not currently hosted in production.

## Important repository invariants

1. `shared/seed-data.ts` is the single source of truth for the curated incident dataset.
2. If `shared/seed-data.ts` changes, regenerate and commit `incidents.json`.
3. Treat changes to only one UI (`index.html` or `client/`) as potentially incomplete because the repo contains two separate implementations that can drift.
4. Keep backend-hosting claims realistic: static hosting cannot make `/api/*` write endpoints work.

## Key paths

- `/index.html` — production static site served today
- `/incidents.json` — committed static data consumed by the deployed site
- `/client` — React + Vite app
- `/server` — Express backend
- `/shared/seed-data.ts` — curated dataset source of truth
- `/script/generate-incidents-json.ts` — generates `incidents.json`
- `/DEPLOYMENT.md` — current deployment reality and operational constraints

## Before you finish a change

- Run the relevant validation commands (`npm run check` at minimum; `npm run build` when behavior or build output may be affected).
- If data changed, ensure both `shared/seed-data.ts` and `incidents.json` are updated together.
- Do not assume the backend is deployed when evaluating user-facing behavior.
