// Canonical severity ramp — single source of truth for all pages/components.
// Mirrors the :root --sev-* tokens in client/src/index.css.
// Inverted grayscale on dark surfaces: brighter = more severe.
export const SEV_COLORS: Record<string, string> = {
  fatal: "#FFFFFF",
  injury: "#D9D9D9",
  robbery: "#A6A6A6",
  assault: "#808080",
  policy: "#595959",
  other: "#595959",
};

export const SEV_FALLBACK = "#A6A6A6";

// Strip HTML from untrusted strings for plain-text display.
// Uses the browser's HTML parser instead of regex replacement, which is
// robust against nested/malformed tags (CodeQL: incomplete multi-character
// sanitization). Returns text content only; nothing is executed or rendered.
export function stripHtml(html: string | undefined | null): string {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent ?? "";
}
