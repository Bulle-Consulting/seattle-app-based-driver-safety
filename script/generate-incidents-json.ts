/**
 * Generates incidents.json — the static data file the deployed site reads.
 *
 * Background: the deployed site fetches `incidents.json` from its own directory
 * on load and every 5 minutes. That file was never committed and never
 * generated, so it 404'd in production and the dashboard silently fell back to
 * a hardcoded sample array (see deployment_review_report.md, Finding 1).
 *
 * This script closes that gap by serialising the repo's own curated dataset
 * (shared/seed-data.ts) — the same dataset the Express API serves — so the
 * static site and the API can no longer report different numbers.
 *
 * It deliberately emits two views of the same records:
 *   `incidents` — the flat legacy shape the hand-written renderer in the root
 *                 index.html already indexes into, so that 208 KB file needs no
 *                 risky field-access refactor.
 *   `records`   — the canonical camelCase shape, identical to what
 *                 GET /api/incidents returns, for the React client's offline
 *                 fallback.
 *
 * Note it does NOT emit `live_feed`. That page is fed by the SPD Blotter RSS
 * proxy, which genuinely requires a backend; synthesising it from curated 2024
 * records would misrepresent stale data as real-time. See DEPLOYMENT.md.
 */
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getTableColumns } from "drizzle-orm";
import { incidents as incidentsTable, type Incident } from "../shared/schema";
import { SEED_DATA } from "../shared/seed-data";
import { computeStats, LAST_VERIFIED } from "../shared/stats";

const INCIDENT_COLUMNS = Object.keys(getTableColumns(incidentsTable)) as (keyof Incident)[];

/** Severities the legacy static renderer has colours for. */
const LEGACY_SEVERITIES = new Set(["fatal", "injury", "robbery", "assault"]);

/** "2024-01-03" -> "Jan 3, 2024". Fixed UTC so output is byte-stable. */
function humanDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function main() {
  // SQLite assigns ids 1..n in insertion order, so index+1 keeps these aligned
  // with the ids GET /api/incidents/:id serves. Every column is spelled out —
  // including the ones the seed literal omits — so a record here is byte-identical
  // to the SELECT the API returns, where absent columns come back as null.
  const records = SEED_DATA.map((incident, i) => {
    const row = { id: i + 1, ...incident } as Record<string, unknown>;
    return Object.fromEntries(
      INCIDENT_COLUMNS.map((col) => [col, row[col] ?? null]),
    ) as Incident;
  });

  const legacy = records.map((r) => ({
    id: r.id,
    date: humanDate(r.date),
    // The renderer calls i.time.split(':') so this must always be a string.
    time: r.timeOfDay ?? "",
    lat: r.lat,
    lng: r.lng,
    // Non-crime rows carry severities ('policy', 'other') the legacy palette
    // has no entry for; 'incident' is its neutral fallback.
    severity: LEGACY_SEVERITIES.has(r.severity) ? r.severity : "incident",
    platform: r.platform,
    neighborhood: r.neighborhood,
    location: r.address,
    desc: r.description,
    // The overview KPI counts 'Open'/'Reported' as unresolved.
    status: r.status === "resolved" ? "Resolved" : "Open",
    source: r.source,
    dashcam: r.hasVideo === 1 ? "confirmed" : null,
    caseStatus: r.caseStatus ?? null,
  }));

  const stats = computeStats(SEED_DATA);
  const now = new Date();

  const payload = {
    schema_version: 1,
    // `dataset_kind` tells the client this is a verified build-time snapshot,
    // not a live scrape, so it can label freshness honestly instead of
    // claiming "Live".
    dataset_kind: "curated-static" as const,
    generated_at: now.toISOString(),
    updated_at: now.toISOString(),
    updated_human: `verified ${LAST_VERIFIED}`,
    source: "shared/seed-data.ts",
    counts: {
      total: stats.total,
      crime: stats.crimeTotal,
      policy_regulatory: stats.policyCount,
      legal_sentencing: stats.legalCount,
    },
    stats,
    incidents: legacy,
    records,
  };

  const json = `${JSON.stringify(payload, null, 2)}\n`;
  return { json, stats };
}

export async function generateIncidentsJson() {
  const { json, stats } = main();

  // Repo root: GitHub Pages is configured to serve `main` at `/`, so the root
  // copy is what production actually fetches.
  const targets = [
    path.resolve(import.meta.dirname, "..", "incidents.json"),
    // Build output, so `npm run build` artifacts are self-sufficient too.
    path.resolve(import.meta.dirname, "..", "dist", "public", "incidents.json"),
  ];

  for (const target of targets) {
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, json, "utf-8");
    console.log(`wrote ${path.relative(process.cwd(), target)}`);
  }

  console.log(
    `incidents.json: ${stats.total} records (${stats.crimeTotal} crime, ` +
      `${stats.policyCount} policy/regulatory, ${stats.legalCount} legal/sentencing)`,
  );
}

if (process.argv[1] && import.meta.filename === path.resolve(process.argv[1])) {
  generateIncidentsJson().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
