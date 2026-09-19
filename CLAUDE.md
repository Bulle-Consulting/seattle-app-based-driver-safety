# CLAUDE.md

Claude Code should use `/home/runner/work/seattle-app-based-driver-safety/seattle-app-based-driver-safety/AGENTS.md` as the canonical repository guide.

## Minimum working context

- Install dependencies with `npm install`
- Type-check with `npm run check`
- Build with `npm run build`
- Start local dev with `npm run dev`
- If `shared/seed-data.ts` changes, run `npm run generate:data` and commit `incidents.json`

## Repo-specific cautions

- Production serves the root `index.html`, not the React app in `client/`
- The Express backend in `server/` exists but is not hosted in production
- `shared/seed-data.ts` is the single source of truth for curated incidents
- `index.html` and `client/` can drift, so changes to only one may be incomplete
