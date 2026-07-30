# Deployment runbook

This document describes **what is actually deployed today**, what this repo can do without a
server, and the specific things a human with infrastructure access still has to provision.

It exists because a deployment review (`deployment_review_report.md`) found that the live site
looked healthy while silently serving stale bundled data, and that the documented architecture
did not match reality.

---

## 1. What is deployed today

| Surface | What serves it | What it is |
|---|---|---|
| GitHub Pages | `Bulle-Consulting/seattle-app-based-driver-safety`, branch `main`, path `/` (Pages "legacy" build — no Actions workflow) | The single-file `index.html` at the repo root |
| `bullecloud.com` | Apache / HostGator | A copy of the same root `index.html` |
| `safetysteward.bullecloud.com` | **nothing — NXDOMAIN** | Advertised as the API base URL but never registered |
| `/api/*` | **nothing** | The Express server in `server/` is never hosted |

Two UIs exist in this repo:

- **`index.html` at the repo root** — hand-maintained, ~208 KB, all HTML/CSS/JS inline. **This
  is what production serves.**
- **`client/`** — a React + Vite app. Builds cleanly, has more pages (incident submission,
  alert sign-up, API docs), and **has never been deployed.**

### Why the React app was not made the deployed artifact

Considered and deliberately deferred. Switching would require:

1. Changing the Pages source from "legacy / branch root" to a GitHub Actions build. That is a
   **repository settings change**, not a code change, and cannot be verified from a pull
   request.
2. Committing build output to `main`, or adding a deploy workflow — both of which change how
   `bullecloud.com`'s Apache copy is kept in sync.
3. Accepting that the React app's three extra pages (`/submit`, `/alerts`, `/api-docs`) depend
   on a backend that is not hosted, so they would ship visibly degraded.

The blast radius on a live, two-host deployment was judged too high to do blind. Instead the
React app was made **backend-optional** (see §3) so that this migration becomes a low-risk
follow-up rather than a rewrite.

> **Drift risk.** Until that migration happens, `index.html` and `client/` are two independent
> implementations of the same product and *will* drift. They now at least share a data source
> (§2), so their published numbers cannot disagree — but content, copy, and routes must be
> changed in both places. Treat any PR that edits one and not the other as incomplete.

---

## 2. Incident data (`incidents.json`)

### Single source of truth

```
shared/seed-data.ts          ← the curated dataset (edit this, and only this)
        │
        ├── server/storage.ts               seeds SQLite for the Express API
        ├── script/generate-incidents-json  writes incidents.json for the static site
        └── shared/stats.ts                 the one aggregation both of them call
```

Regenerate after **any** edit to `shared/seed-data.ts`:

```bash
npm run generate:data
```

This writes two copies and prints the counts:

- `./incidents.json` — **committed to the repo**, because GitHub Pages serves the repo root
  directly. If this file is not committed, production 404s.
- `./dist/public/incidents.json` — so `npm run build` output is self-sufficient.

`npm run build` runs the generator automatically (after Vite, which clears `dist/`).

### Deploy checklist for a data change

1. Edit `shared/seed-data.ts`.
2. `npm run generate:data`
3. `npm run check` and `npm run build`
4. Commit **both** `shared/seed-data.ts` and `incidents.json`.
5. Merging to `main` publishes to GitHub Pages automatically.
6. **Manually** copy the updated `index.html` + `incidents.json` to HostGator for
   `bullecloud.com` — there is no automation for that host.
7. Verify: `curl -sSf https://<host>/incidents.json | head -c 200` returns JSON, not HTML.

### Failure is now visible, not silent

Previously a missing `incidents.json` was caught and swallowed: the page rendered a hardcoded
sample array and only a small sidebar pill changed text, so a broken deployment was
indistinguishable from a healthy one.

Now, if the fetch fails:

- The static site shows a **persistent banner** above the page content saying the data could
  not be loaded and the numbers are not authoritative, and logs `console.error`.
- The sidebar freshness pill reads `Sample data · incidents.json unavailable`.
- The React app shows an equivalent banner via `client/src/components/DataSourceBanner.tsx`.

The pill also no longer claims **"Live"** for the curated snapshot. `incidents.json` carries
`dataset_kind: "curated-static"`, and the UI labels it `Curated dataset · verified <date>`.

### The missing scraper

Shipped code used to reference a `scrape.php` and a `SETUP.md` that describe a 15-minute
HostGator cron job writing `incidents.json` from a live SPD feed. **Neither file exists in this
repository**, in any branch, or in the git history. Its behaviour was not safely inferable, so
it has **not** been recreated; the dead references were removed and replaced by the build-time
generator above.

Consequence: **`incidents.json` is a verified snapshot, not a live scrape.** If a live SPD feed
is wanted, that is new work — see §4.

---

## 3. APIs: what works statically, what needs a server

`client/src/lib/staticData.ts` makes the React app read from `incidents.json` when no backend
answers. Detection is by content-type, not status code: a static host answers `/api/*` with an
HTML 404 page, whereas Express always answers JSON — including for a legitimate "unknown
incident id" 404. So a real backend's 404s are still honoured.

### Satisfied statically — no hosting needed

| Endpoint | Static behaviour |
|---|---|
| `GET /api/incidents` | served from `incidents.json` → `records` |
| `GET /api/incidents/:id` | looked up in `records`; real 404 if absent |
| `GET /api/stats` | served from `incidents.json` → `stats` (same `computeStats()` the API uses) |
| `GET /api/submissions` | `[]` — honest: with no database there are no stored submissions |
| `GET /api/alerts` | `[]` — same |

### Requires a hosted backend — **cannot be fixed by a code change**

| Endpoint | Why | Current behaviour without a backend |
|---|---|---|
| `POST /api/submissions` | Must persist a public incident report | Form shows an explicit error naming this document |
| `POST /api/alerts` | Must persist an email/SMS subscription | Same |
| `GET /api/spd-blotter` | Server-side proxy for `spdblotter.seattle.gov/feed/`; exists purely to work around CORS, which a browser cannot bypass | Live Feed panel renders "Could not fetch SPD Blotter: …" |

Alert **delivery** (actually emailing or texting subscribers) does not exist in this repo at
all — `POST /api/alerts` only records a subscription. Delivery is unimplemented, not merely
undeployed.

---

## 4. Action required from a human with infrastructure access

Each item below is blocked on access this repository does not have.

### 4.1 Host the Express backend  ·  *needed for incident reports and alert sign-ups*

```bash
npm ci
npm run build          # → dist/index.cjs (bundled server) + dist/public (client)
NODE_ENV=production PORT=5000 npm start
```

- Node.js 20+. Listens on `$PORT`, default `5000`, host `0.0.0.0`.
- **Requires a writable persistent disk.** `better-sqlite3` opens `ridewatch.db` relative to
  the process working directory. A read-only or ephemeral filesystem loses every submission on
  restart. Any container platform needs a mounted volume.
- The database self-creates its tables and seeds from `shared/seed-data.ts` on first boot; no
  migration step is required. `npm run db:push` (drizzle-kit) exists but is not needed for
  SQLite bootstrap.
- No environment variables or secrets are required. There is no auth on any endpoint, so
  `POST /api/submissions` and `POST /api/alerts` are **unauthenticated and unrate-limited** —
  put them behind a rate limiter and/or CAPTCHA before exposing them publicly.
- Serve it over HTTPS at a hostname the frontend can reach, then wire the frontend to it (see
  §4.3).

### 4.2 Register DNS for `safetysteward.bullecloud.com`

Currently **NXDOMAIN**. It is advertised as the public API base URL on the API Docs page, so
that page documents endpoints that cannot be reached. Create the record and point it at the
host from §4.1, **or** decide the public API is not offered and remove the claim.

### 4.3 Point the frontend at the backend once it exists

`client/src/lib/queryClient.ts` derives its API base from a `__PORT_5000__` build-time
placeholder and otherwise uses same-origin relative URLs. If the backend lives on a *different*
origin than the static site, that base must be set **and** CORS must be enabled on the Express
app (it currently sends no CORS headers). Until then the static fallback in §3 is what runs.

### 4.4 Automate the `bullecloud.com` (HostGator) copy

That host is updated by hand, so it can silently fall behind `main`. Either add a deploy step
(rsync/FTP from CI) or make it a CNAME to GitHub Pages so there is one artifact instead of two.

### 4.5 Optional: restore a live SPD data feed

The original `scrape.php` cron job is gone (§2). Replacing it means new work: a scheduled job
that pulls SPD Blotter / SPD Open Data, applies the verification rules in `README.md`, and
writes an `incidents.json` in the shape `script/generate-incidents-json.ts` emits. Until then
the site must keep describing its data as a verified snapshot rather than live.

### 4.6 Consider deploying `client/` (see §1)

Requires flipping the Pages source to an Actions workflow — a repository settings change.

---

## 5. Verifying a deployment

```bash
# Data file must exist and be JSON, not an HTML 404 page
curl -sS -o /dev/null -w '%{http_code} %{content_type}\n' https://<host>/incidents.json

# Counts must match `npm run generate:data` output
curl -sS https://<host>/incidents.json | python3 -c 'import json,sys; print(json.load(sys.stdin)["counts"])'
```

Then load the site and confirm:

- No data-error banner is visible.
- The sidebar reads `Curated dataset · verified <date>` — not `Sample data`.
- The browser console is free of `incidents.json` errors.

If a backend was provisioned, also check `GET /api/stats` returns the same `counts`, and that
`GET /api/incidents/99999` returns a JSON `404` (proving the API — not the static fallback — is
answering).
