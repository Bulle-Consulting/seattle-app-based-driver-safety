// Canonical risk scale — single source of truth for all pages/components.
// Mirrors the :root --risk-* / --sev-* tokens in client/src/index.css.
//
// Three tiers replace the old five-step ramp:
//   high (#C2185B) — the driver suffered bodily harm or was physically attacked
//   mod  (#F2A035) — the driver was threatened during a forcible theft
//   low  (#20BAD1) — regulatory / court / news records, no active threat
// #F2A035 and #C2185B are reserved: they appear nowhere outside this scale.
export type RiskTier = "low" | "mod" | "high";

export const RISK_TIERS: Record<RiskTier, { label: string; fill: string; ink: string; bg: string }> = {
  low:  { label: "Low risk",      fill: "#20BAD1", ink: "#157B8A", bg: "#E9F8FA" },
  mod:  { label: "Moderate risk", fill: "#F2A035", ink: "#A5620B", bg: "#FEF6EB" },
  high: { label: "High risk",     fill: "#C2185B", ink: "#C2185B", bg: "#F9E8EF" },
};

export const SEV_TIER: Record<string, RiskTier> = {
  fatal: "high",
  injury: "high",
  assault: "high",
  robbery: "mod",
  policy: "low",
  other: "low",
  incident: "low",
};

export function riskTier(severity: string | undefined | null): RiskTier {
  return SEV_TIER[String(severity ?? "").toLowerCase()] ?? "low";
}

export function riskLabel(severity: string | undefined | null): string {
  return RISK_TIERS[riskTier(severity)].label;
}

// Solid mark colour for a severity — used for map pins, dots and bar fills.
export const SEV_COLORS: Record<string, string> = Object.fromEntries(
  Object.entries(SEV_TIER).map(([sev, tier]) => [sev, RISK_TIERS[tier].fill]),
);

export const SEV_FALLBACK = RISK_TIERS.low.fill;

// Strip HTML from untrusted strings for plain-text display.
// Uses the browser's HTML parser instead of regex replacement, which is
// robust against nested/malformed tags (CodeQL: incomplete multi-character
// sanitization). Returns text content only; nothing is executed or rendered.
export function stripHtml(html: string | undefined | null): string {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent ?? "";
}
