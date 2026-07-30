# Seattle App-Based Driver Safety

**A data intelligence dashboard tracking verified crime incidents against app-based rideshare and delivery drivers in the Seattle metro area.**

Built by [Bulle Cloud](https://bullecloud.com) · Powered by verified data from SPD, local news, and court records.

---

## Overview

This dashboard provides a centralized, interactive view of documented safety incidents affecting app-based workers (Uber, Lyft, DoorDash, Amazon Flex) across the Seattle metropolitan area from 2024 to present. It is designed as a professional analytics tool for policy research, worker safety advocacy, and civic intelligence.

### Features

- **Interactive Map** — Leaflet-based map with incident pins color-coded by severity, clickable popups, and heatmap overlay toggle
- **KPI Dashboard** — Animated counters for Crime Total, Fatal, Injury, Robbery, Assault, and Open Cases
- **Severity Filtering** — Click any KPI card or donut chart slice to filter the entire dashboard by severity type
- **Year Filters** — Filter all data by year (2024, 2025, 2026)
- **Incident Detail Modal** — Full detail view with description, victim info, location, coordinates, and source links
- **Searchable Table** — Full incident database with search, sort, platform/severity/status filters, and CSV export
- **Live Feed** — Real-time SPD Blotter RSS integration alongside the verified incident stream
- **Source Links** — Every verified incident links to its primary news source
- **Data Classification** — Crime incidents separated from policy/regulatory entries and legal/sentencing updates; non-crime entries excluded from severity KPIs

### Pages

1. **Overview** — KPIs, map, recent incidents, charts (monthly trend, severity breakdown, platform breakdown, hotspot neighborhoods)
2. **Crime Map** — Full-screen interactive map with platform and severity filters
3. **Incidents** — Complete searchable/filterable table with CSV export
4. **Live Feed** — Verified incident stream + live SPD Blotter RSS feed + Seattle crime context statistics

---

## Data Sources

| Source | Type | Usage |
|---|---|---|
| [SPD Open Data Portal](https://data.seattle.gov) | Official | Seattle Police Department crime statistics |
| [SPD Blotter](https://spdblotter.seattle.gov) | Official | Incident reports, RSS feed for live updates |
| [KOMO News](https://komonews.com) | News | Incident reporting, court outcomes |
| [KIRO 7](https://www.kiro7.com) | News | Incident reporting, video documentation |
| [Fox 13 Seattle](https://www.fox13seattle.com) | News | Incident reporting, investigations |
| [Cascade PBS](https://www.cascadepbs.org) | News | In-depth investigative reporting |
| King County Prosecutors | Legal | Sentencing records, case outcomes |
| Ninth Circuit Court | Legal | Regulatory rulings |
| City of Seattle OLS | Regulatory | App-Based Worker Deactivation Rights Ordinance |

---

## Verification Methodology

Every incident in the database is classified and verified using the following process:

1. **Primary source identification** — Each incident must have at least one verifiable source (news article, SPD Blotter post, or court record)
2. **Cross-referencing** — Where possible, incidents are cross-referenced against multiple sources (e.g., SPD Blotter + news coverage)
3. **Date verification** — Dates are verified against the original source publication or police report date
4. **Victim/suspect identification** — Named individuals are verified against court records where available
5. **Source URLs** — Direct links to primary sources are stored and displayed for each verified incident
6. **Classification** — Incidents are categorized as:
   - `crime` — Verified crime incidents with rideshare/delivery worker connection
   - `policy_regulatory` — Policy changes, investigations, or regulatory rulings (not counted in crime KPIs)
   - `legal_sentencing` — Court sentencing updates for previously documented crimes (not counted in crime KPIs)
7. **Removal criteria** — Incidents without corroborating news sources are removed with documented reason
8. **Regional labeling** — Non-Seattle incidents (Edmonds, Everett, Bellevue, Tukwila, Vancouver WA) are labeled as "Seattle Metro" or "Regional"

**Disclaimer:** Incidents sourced from SPD Blotter are based on general crime data. Individual rideshare connection may not be independently verified for all entries.

---

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + Recharts + Leaflet.js
- **Backend**: Express.js + SQLite (better-sqlite3) + Drizzle ORM
- **Mapping**: Leaflet with CartoDB Positron tiles + leaflet.heat for heatmap overlay
- **Live Data**: SPD Blotter RSS feed proxy (`/api/spd-blotter`) — backend-only, see [DEPLOYMENT.md](DEPLOYMENT.md)
- **Deploy**: GitHub Pages serves the repo root of `main` (the single-file `index.html`);
  `bullecloud.com` is served from Apache/HostGator. No backend is currently hosted — see
  [DEPLOYMENT.md](DEPLOYMENT.md) for what that costs you and how to provision it.

---

## Build & Run

### Prerequisites

- Node.js 20+
- npm

### Development

```bash
# Install dependencies
npm install

# Start development server (frontend + backend on same port)
npm run dev
```

The dev server runs on `http://localhost:5000`.

### Production Build

```bash
# Build frontend + backend
npm run build

# Start production server
NODE_ENV=production node dist/index.cjs
```

### API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/incidents` | All incidents |
| `GET /api/incidents/:id` | Single incident by ID |
| `GET /api/stats` | Aggregated statistics (KPIs, breakdowns by severity/platform/neighborhood/month) |
| `GET /api/spd-blotter` | Live SPD Blotter RSS feed proxy (cached, re-fetched every 5 min) |

---

## Project Structure

```
├── client/                  # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/      # Sidebar, Header, SeattleMap, SeverityBadge
│   │   ├── pages/           # Dashboard, MapPage, IncidentsPage, LiveFeed
│   │   ├── lib/             # Query client, utilities
│   │   └── index.css        # Design tokens, badge styles
│   └── index.html
├── server/                  # Backend (Express)
│   ├── routes.ts            # API endpoints
│   ├── storage.ts           # SQLite + Drizzle ORM + seed data
│   └── index.ts             # Server entry
├── shared/
│   └── schema.ts            # Database schema (Drizzle)
└── README.md
```

---

## Data as of April 17, 2026

The single source of truth is [`shared/seed-data.ts`](shared/seed-data.ts). The Express API
seeds SQLite from it, `npm run generate:data` serialises it into `incidents.json` for the
static site, and the React client falls back to that JSON when no backend is reachable — so
the figures below, `/api/stats`, and the deployed dashboard cannot disagree. Regenerate the
counts with `npm run generate:data`, which prints them.

- **31 total entries** (28 crime incidents + 2 policy/regulatory + 1 legal/sentencing)
- **1 fatal** (Edmonds homicide, Jan 2024)
- **4 injury** (stabbings, shootings, vehicular assault)
- **13 robbery** (armed robberies, carjackings, package theft)
- **10 assault** (physical attacks, sexual assaults, attempted shootings)
- **18 open cases** under investigation
- **13 resolved** (arrests, convictions, sentencing)

---

## License

This project is proprietary to Bulle Cloud. Data sources are attributed to their respective publishers.
