// Brand palette for contexts that need a literal colour string (Recharts,
// Leaflet, canvas). Mirrors the :root tokens in client/src/index.css, which
// remain the single source of truth for everything CSS can reach.
//
// #20BAD1 on #FFFFFF is only 2.33:1, so BRAND.teal is for fills and non-text
// marks only; BRAND.tealInk (#157B8A, 4.96:1 on white) is the legible variant.
export const BRAND = {
  teal: "#20BAD1",
  tealInk: "#157B8A",
  tealDim: "#10606C",
  navy: "#061A3A",
  charcoal: "#222222",
  tint: "#EFF7F8",
  tintDeep: "#D6F0F3",
  white: "#FFFFFF",
  ink2: "#44536B",
  ink3: "#5D6A7F",
  border: "#C7EEF4",
  borderSoft: "#E0F5F9",
} as const;

// Generic chart sequence: brand teal, deep navy, then teal mixed toward
// white at 60% (#A6E3ED) and 30% (#63CFDF). Charts that encode risk use the
// severity scale in ./severity instead.
export const CHART_SERIES = [BRAND.teal, BRAND.navy, "#A6E3ED", "#63CFDF"] as const;
export const CHART_GRID = BRAND.tintDeep;
export const CHART_AXIS = BRAND.ink2;
