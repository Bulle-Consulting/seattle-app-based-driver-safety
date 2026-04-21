// In-place page translator using Google Translate's public AJAX endpoint.
// No external UI, no popups, no new tabs. Translates visible text nodes in place.
// Preserves numbers, URLs, and pure-symbolic strings. Supports RTL languages.

// Primary: Google Translate AJAX (no key, no limits for reasonable usage)
// Fallbacks: Lingva (Google proxy), MyMemory
const GOOGLE_API = "https://translate.googleapis.com/translate_a/single";
const LINGVA_ENDPOINTS = [
  "https://lingva.ml/api/v1",
  "https://translate.plausibility.cloud/api/v1",
];
const MYMEMORY_API = "https://api.mymemory.translated.net/get";
const RTL_LANGS = new Set(["ar", "fa", "ps", "he", "ur"]);

// Google Translate uses short codes with zh-CN for Simplified Chinese
const GOOGLE_CODE: Record<string, string> = {
  en: "en", so: "so", am: "am", ti: "ti", om: "om", tl: "tl",
  es: "es", vi: "vi", "zh-CN": "zh-CN", fa: "fa", ps: "ps", ar: "ar",
};

// Lingva uses short codes (en, es, zh, etc.)
const LINGVA_CODE: Record<string, string> = {
  en: "en", so: "so", am: "am", ti: "ti", om: "om", tl: "tl",
  es: "es", vi: "vi", "zh-CN": "zh", fa: "fa", ps: "ps", ar: "ar",
};

// MyMemory language codes (fallback)
const MYMEMORY_CODE: Record<string, string> = {
  en: "en-US", so: "so-SO", am: "am-ET", ti: "ti-ET", om: "om-ET",
  tl: "tl-PH", es: "es-ES", vi: "vi-VN", "zh-CN": "zh-CN",
  fa: "fa-IR", ps: "ps-AF", ar: "ar-SA",
};

type OriginalNode = { node: Text; original: string };
let originalNodes: OriginalNode[] = [];
let currentLang = "en";
let inFlight = false;

// WeakMap: text node -> its original English text (used by the setter patch).
const nodeOriginals = new WeakMap<Text, string>();

// When true, the setter patch should pass through values unchanged (used while we
// apply translated text ourselves so the patch doesn't misinterpret translated
// strings as originals).
let bypassPatch = false;

// Regex helpers
const PURE_SYMBOL = /^[\s\d\W]*$/; // only numbers, whitespace, punctuation
const URL_LIKE = /^https?:\/\//i;

// Persistent cache keyed by `${lang}::${text}`
const CACHE_KEY = "translator_cache_v1";
let cache: Record<string, string> = (() => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
})();

function saveCache() {
  try {
    // Cap cache size so it doesn't grow unbounded
    const keys = Object.keys(cache);
    if (keys.length > 2000) {
      const trimmed: Record<string, string> = {};
      for (const k of keys.slice(-1500)) trimmed[k] = cache[k];
      cache = trimmed;
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch { /* storage full or disabled */ }
}

function collectTextNodes(root: Node): Text[] {
  const out: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      const t = (n.nodeValue || "").trim();
      if (!t) return NodeFilter.FILTER_REJECT;
      if (PURE_SYMBOL.test(t)) return NodeFilter.FILTER_REJECT;
      if (URL_LIKE.test(t)) return NodeFilter.FILTER_REJECT;
      // skip script/style/noscript
      const p = n.parentElement;
      if (!p) return NodeFilter.FILTER_REJECT;
      const tag = p.tagName;
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return NodeFilter.FILTER_REJECT;
      // skip nodes inside elements we don't want translated
      if (p.closest("[data-no-translate]")) return NodeFilter.FILTER_REJECT;
      // skip very short strings that are likely icons/symbols (1 char non-letter)
      if (t.length === 1 && !/[a-zA-Z]/.test(t)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let node: Node | null;
  while ((node = walker.nextNode())) out.push(node as Text);
  return out;
}

function snapshotOriginals() {
  if (originalNodes.length > 0) return; // already snapshotted
  const nodes = collectTextNodes(document.body);
  originalNodes = nodes.map((n) => {
    const original = n.nodeValue || "";
    nodeOriginals.set(n, original);
    return { node: n, original };
  });
}

// Patch Text.prototype's nodeValue and data setters so that whenever React commits
// an English original to a text node we've seen before, we instead commit the cached
// translation. This prevents React re-renders from reverting our translations.
let isPatched = false;
export function installTextNodePatch() {
  if (isPatched) return;
  isPatched = true;

  const patchDescriptor = (proto: any, key: string) => {
    const desc = Object.getOwnPropertyDescriptor(proto, key);
    if (!desc || !desc.set || !desc.get) return;
    const origSet = desc.set;
    Object.defineProperty(proto, key, {
      ...desc,
      set(this: Text, value: any) {
        if (!bypassPatch && currentLang !== "en" && typeof value === "string") {
          const trimmed = value.trim();
          if (trimmed && /[a-zA-Z]/.test(trimmed)) {
            const cacheKey = `${currentLang}::${trimmed}`;
            const translated = cache[cacheKey];
            if (translated && translated !== trimmed) {
              const leading = value.match(/^\s*/)?.[0] ?? "";
              const trailing = value.match(/\s*$/)?.[0] ?? "";
              nodeOriginals.set(this, value);
              origSet.call(this, leading + translated + trailing);
              return;
            } else if (!translated) {
              nodeOriginals.set(this, value);
            }
          }
        }
        origSet.call(this, value);
      },
    });
  };

  patchDescriptor(Node.prototype, "nodeValue");
  patchDescriptor(CharacterData.prototype, "data");
}

// Internal alias kept for backward compat
function patchTextNodeSetter() { installTextNodePatch(); }

function buildReverseCache(forLang: string): Map<string, string> {
  const reverse = new Map<string, string>();
  const prefix = `${forLang}::`;
  for (const k of Object.keys(cache)) {
    if (k.startsWith(prefix)) {
      const translated = cache[k];
      const originalEnglish = k.slice(prefix.length);
      reverse.set(translated, originalEnglish);
    }
  }
  return reverse;
}

function restoreOriginals() {
  const langToRestore = currentLang !== "en" ? currentLang : null;
  const reverse = langToRestore ? buildReverseCache(langToRestore) : null;

  bypassPatch = true;
  try {
    // Restore from our originalNodes snapshot
    for (const { node, original } of originalNodes) {
      if (node.isConnected) node.nodeValue = original;
    }
    // Also walk the DOM and for any translated text that matches our reverse cache, revert
    if (reverse) {
      const nodes = collectTextNodes(document.body);
      for (const node of nodes) {
        const value = node.nodeValue || "";
        const trimmed = value.trim();
        if (!trimmed) continue;
        const originalEnglish = reverse.get(trimmed);
        if (originalEnglish) {
          const leading = value.match(/^\s*/)?.[0] ?? "";
          const trailing = value.match(/\s*$/)?.[0] ?? "";
          node.nodeValue = leading + originalEnglish + trailing;
        }
      }
    }
  } finally {
    bypassPatch = false;
  }
  document.documentElement.setAttribute("dir", "ltr");
  document.documentElement.setAttribute("lang", "en");
}

async function translateViaGoogle(text: string, targetLang: string): Promise<string | null> {
  const tgt = GOOGLE_CODE[targetLang] || targetLang;
  const url = `${GOOGLE_API}?client=gtx&sl=en&tl=${tgt}&dt=t&q=${encodeURIComponent(text)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    // Response shape: [[[translatedText, originalText, ...], ...], ...]
    if (Array.isArray(data) && Array.isArray(data[0])) {
      const pieces: string[] = [];
      for (const chunk of data[0]) {
        if (Array.isArray(chunk) && typeof chunk[0] === "string") {
          pieces.push(chunk[0]);
        }
      }
      const translated = pieces.join("");
      if (translated && translated.length > 0) return translated;
    }
  } catch {
    // fall through
  }
  return null;
}

// Track which Lingva endpoint is currently working (fall through on failure)
let lingvaIdx = 0;

async function translateViaLingva(text: string, targetLang: string): Promise<string | null> {
  const tgt = LINGVA_CODE[targetLang] || targetLang;
  const encoded = encodeURIComponent(text);
  // Try up to 3 endpoints
  for (let attempt = 0; attempt < LINGVA_ENDPOINTS.length; attempt++) {
    const endpoint = LINGVA_ENDPOINTS[(lingvaIdx + attempt) % LINGVA_ENDPOINTS.length];
    try {
      const res = await fetch(`${endpoint}/en/${tgt}/${encoded}`);
      if (!res.ok) continue;
      const data = await res.json();
      const t = data?.translation;
      if (typeof t === "string" && t.length > 0 && !/error/i.test(t)) {
        lingvaIdx = (lingvaIdx + attempt) % LINGVA_ENDPOINTS.length;
        return t;
      }
    } catch {
      continue;
    }
  }
  return null;
}

async function translateViaMyMemory(text: string, targetLang: string): Promise<string | null> {
  const src = MYMEMORY_CODE.en;
  const tgt = MYMEMORY_CODE[targetLang] || targetLang;
  const url = `${MYMEMORY_API}?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(src + "|" + tgt)}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (typeof translated === "string" && translated.length > 0 && !/^MYMEMORY WARNING/i.test(translated)) {
      return translated;
    }
  } catch {
    // fall through
  }
  return null;
}

async function translateOne(text: string, targetLang: string): Promise<string> {
  const key = `${targetLang}::${text}`;
  if (cache[key]) return cache[key];

  // Try Google Translate first (fast, unlimited)
  let translated = await translateViaGoogle(text, targetLang);
  if (!translated) {
    // Fall back to Lingva
    translated = await translateViaLingva(text, targetLang);
  }
  if (!translated) {
    // Final fallback to MyMemory
    translated = await translateViaMyMemory(text, targetLang);
  }

  if (translated) {
    cache[key] = translated;
    return translated;
  }
  return text;
}

async function runBatch(items: OriginalNode[], targetLang: string, onProgress?: (done: number, total: number) => void) {
  // Deduplicate by original text so we don't translate the same string twice
  const unique = new Map<string, string>(); // original -> translated
  const uniqueList: string[] = [];
  for (const it of items) {
    const t = it.original.trim();
    if (!t) continue;
    if (!unique.has(t)) {
      unique.set(t, "");
      uniqueList.push(t);
    }
  }

  // Process with higher concurrency since Google AJAX is fast and distributed
  const CONCURRENCY = 8;
  let idx = 0;
  let done = 0;

  async function worker() {
    while (idx < uniqueList.length) {
      const myIdx = idx++;
      const text = uniqueList[myIdx];
      const translated = await translateOne(text, targetLang);
      unique.set(text, translated);
      done++;
      onProgress?.(done, uniqueList.length);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  // Apply translations to nodes (bypass patch so we can write translated text directly)
  let applied = 0;
  bypassPatch = true;
  try {
    for (const it of items) {
      const key = it.original.trim();
      const translated = unique.get(key);
      if (translated && it.node.isConnected) {
        const leading = it.original.match(/^\s*/)?.[0] ?? "";
        const trailing = it.original.match(/\s*$/)?.[0] ?? "";
        it.node.nodeValue = leading + translated + trailing;
        applied++;
      }
    }
  } finally {
    bypassPatch = false;
  }


  saveCache();
}

export async function translatePage(
  targetLang: string,
  onProgress?: (done: number, total: number) => void
): Promise<void> {
  if (inFlight) return;
  inFlight = true;
  try {
    if (targetLang === "en") {
      restoreOriginals();
      currentLang = "en";
      return;
    }

    snapshotOriginals();

    // If we're switching from a non-en language to another non-en, restore first so we translate from original English
    if (currentLang !== "en") {
      restoreOriginals();
    }

    currentLang = targetLang;

    // Apply dir + lang first so RTL kicks in immediately
    document.documentElement.setAttribute("lang", targetLang);
    document.documentElement.setAttribute("dir", RTL_LANGS.has(targetLang) ? "rtl" : "ltr");

    await runBatch(originalNodes, targetLang, onProgress);
  } finally {
    inFlight = false;
  }
}

export function getCurrentLang(): string {
  return currentLang;
}

// Fast-path: apply cached translations to any text nodes that haven't been translated yet.
// Does NOT make API calls. Safe to call frequently (e.g., from MutationObserver).
function applyCachedTranslationsSync(): { newUntranslated: Text[] } {
  if (currentLang === "en") return { newUntranslated: [] };
  const nodes = collectTextNodes(document.body);
  const newUntranslated: Text[] = [];
  bypassPatch = true;
  try {
    for (const node of nodes) {
      const value = node.nodeValue || "";
      const trimmed = value.trim();
      if (!trimmed) continue;
      const key = `${currentLang}::${trimmed}`;
      const cached = cache[key];
      if (cached && value.includes(trimmed) && trimmed !== cached) {
        const leading = value.match(/^\s*/)?.[0] ?? "";
        const trailing = value.match(/\s*$/)?.[0] ?? "";
        const next = leading + cached + trailing;
        if (node.nodeValue !== next) {
          node.nodeValue = next;
          nodeOriginals.set(node, value);
        }
      } else if (!cached) {
        newUntranslated.push(node);
      }
      const known = originalNodes.find((o) => o.node === node);
      if (!known) {
        originalNodes.push({ node, original: trimmed });
        nodeOriginals.set(node, value);
      }
    }
  } finally {
    bypassPatch = false;
  }
  return { newUntranslated };
}

// Re-scan the DOM for new text nodes (e.g. after route change) and translate them
// if a non-English language is active. Safe to call multiple times.
export async function retranslateNewContent(): Promise<void> {
  if (currentLang === "en") return;

  // First pass: apply cached translations synchronously (no API calls, instant)
  const { newUntranslated } = applyCachedTranslationsSync();

  if (newUntranslated.length === 0) return;
  if (inFlight) {
    await new Promise((r) => setTimeout(r, 300));
    if (inFlight) return;
  }

  const newEntries: OriginalNode[] = newUntranslated.map((n) => ({ node: n, original: n.nodeValue || "" }));

  inFlight = true;
  try {
    await runBatch(newEntries, currentLang);
  } finally {
    inFlight = false;
  }
}

// Install a MutationObserver so that any newly-added text gets translated automatically.
let observer: MutationObserver | null = null;
let observerTimer: number | null = null;

export function startObserver() {
  patchTextNodeSetter();
  if (observer) return;

  // Throttle the slow (API-calling) retranslate pass so the clock ticking every second
  // doesn't kick off API calls constantly.
  observer = new MutationObserver((mutations) => {
    if (currentLang === "en") return;

    // Check if any mutation is outside [data-no-translate] and involves real content
    let relevant = false;
    for (const m of mutations) {
      const target = m.target as Element;
      const el = target.nodeType === 1 ? target : target.parentElement;
      if (el && !el.closest?.("[data-no-translate]")) {
        relevant = true;
        break;
      }
    }
    if (!relevant) return;

    // Debounced slow-path: translate anything new that isn't cached
    if (observerTimer !== null) window.clearTimeout(observerTimer);
    observerTimer = window.setTimeout(() => {
      retranslateNewContent();
    }, 700);
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: false });
}

export function stopObserver() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}
