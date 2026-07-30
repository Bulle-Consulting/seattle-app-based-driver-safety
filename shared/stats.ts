import type { Incident } from "./schema";

/**
 * Only the fields the aggregation actually reads, so this works equally on rows
 * from SQLite and on records parsed out of the generated incidents.json.
 */
export type StatsInput = Pick<
  Incident,
  | "category"
  | "severity"
  | "status"
  | "platform"
  | "neighborhood"
  | "date"
  | "timeOfDay"
  | "hasVideo"
  | "suspectName"
  | "caseStatus"
>;

export const LAST_VERIFIED = "2026-04-17";

/**
 * Shared by the Express /api/stats handler and by the client's offline
 * fallback. Both call this so a backend-less deployment reports exactly the
 * same numbers the API would.
 */
export function computeStats(all: StatsInput[]) {
  const total = all.length;

  const crimeOnly = all.filter((i) => i.category === "crime");
  const fatal = crimeOnly.filter((i) => i.severity === "fatal").length;
  const injury = crimeOnly.filter((i) => i.severity === "injury").length;
  const robbery = crimeOnly.filter((i) => i.severity === "robbery").length;
  const assault = crimeOnly.filter((i) => i.severity === "assault").length;
  const policyCount = all.filter((i) => i.category === "policy_regulatory").length;
  const legalCount = all.filter((i) => i.category === "legal_sentencing").length;

  const resolved = all.filter((i) => i.status === "resolved").length;
  const underInvestigation = all.filter((i) => i.status === "under investigation").length;

  const withVideo = all.filter((i) => i.hasVideo === 1).length;
  const withSuspect = all.filter((i) => i.suspectName).length;

  const byPlatform: Record<string, number> = {};
  for (const i of crimeOnly) byPlatform[i.platform] = (byPlatform[i.platform] || 0) + 1;

  const byNeighborhood: Record<string, number> = {};
  for (const i of crimeOnly) byNeighborhood[i.neighborhood] = (byNeighborhood[i.neighborhood] || 0) + 1;

  const byMonth: Record<string, number> = {};
  for (const i of crimeOnly) {
    const month = i.date.substring(0, 7);
    byMonth[month] = (byMonth[month] || 0) + 1;
  }

  const byHour: Record<number, number> = {};
  for (let h = 0; h < 24; h++) byHour[h] = 0;
  for (const i of crimeOnly) {
    if (i.timeOfDay) {
      const hour = parseInt(i.timeOfDay.split(":")[0]);
      if (!isNaN(hour)) byHour[hour]++;
    }
  }

  const repeatLocations = Object.entries(byNeighborhood)
    .filter(([, v]) => v >= 2)
    .sort(([, a], [, b]) => b - a);

  const byQuarter: Record<string, number> = {};
  for (const i of crimeOnly) {
    const y = i.date.substring(0, 4);
    const m = parseInt(i.date.substring(5, 7));
    const q = Math.ceil(m / 3);
    byQuarter[`${y} Q${q}`] = (byQuarter[`${y} Q${q}`] || 0) + 1;
  }

  const caseStatuses: Record<string, number> = {};
  for (const i of all) {
    if (i.caseStatus) caseStatuses[i.caseStatus] = (caseStatuses[i.caseStatus] || 0) + 1;
  }

  return {
    total,
    fatal,
    injury,
    robbery,
    assault,
    policyCount,
    legalCount,
    crimeTotal: crimeOnly.length,
    resolved,
    underInvestigation,
    withVideo,
    withSuspect,
    byPlatform,
    byNeighborhood,
    byMonth,
    byHour,
    repeatLocations,
    byQuarter,
    caseStatuses,
    lastVerified: LAST_VERIFIED,
  };
}
