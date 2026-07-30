import { RefreshCw, ChevronDown, Menu } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { translatePage, retranslateNewContent, getCurrentLang, startObserver } from "@/lib/translator";
import { useHashLocation } from "wouter/use-hash-location";

const LANGUAGES = [
  { code: "en", name: "English", native: "English" },
  { code: "so", name: "Somali", native: "Soomaali" },
  { code: "am", name: "Amharic", native: "አማርኛ" },
  { code: "ti", name: "Tigrinya", native: "ትግርኛ" },
  { code: "om", name: "Oromiffa", native: "Afaan Oromoo" },
  { code: "tl", name: "Tagalog", native: "Tagalog" },
  { code: "es", name: "Spanish", native: "Español" },
  { code: "vi", name: "Vietnamese", native: "Tiếng Việt" },
  { code: "zh-CN", name: "Chinese", native: "中文" },
  { code: "fa", name: "Farsi", native: "فارسی" },
  { code: "ps", name: "Pashto", native: "پښتو" },
  { code: "ar", name: "Arabic", native: "العربية" },
];

/* Rotating globe SVG — Earth-like spin animation */
function RotatingGlobe({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="rotating-globe" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <ellipse cx="12" cy="12" rx="4" ry="10" stroke="currentColor" strokeWidth="1.2" className="globe-meridian" />
      <path d="M2 12h20" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <path d="M4 7h16" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
      <path d="M4 17h16" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
    </svg>
  );
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuToggle?: () => void;
}

export default function Header({ title, subtitle, onMenuToggle }: HeaderProps) {
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [activeLang, setActiveLang] = useState(() => getCurrentLang());
  const [translating, setTranslating] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();
  const [location] = useHashLocation();

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  /* Start the MutationObserver once so new DOM content gets auto-translated */
  useEffect(() => {
    startObserver();
    // Also retranslate on mount if a non-English language is active
    if (getCurrentLang() !== "en") {
      const timers = [200, 800, 1800, 3500].map((ms) =>
        setTimeout(() => { retranslateNewContent(); }, ms)
      );
      return () => { timers.forEach(clearTimeout); };
    }
  }, []);

  /* On route change, retranslate new page content */
  useEffect(() => {
    if (activeLang === "en") return;
    const timers = [300, 1200, 2500].map((ms) =>
      setTimeout(() => { retranslateNewContent(); }, ms)
    );
    return () => { timers.forEach(clearTimeout); };
  }, [location, activeLang]);

  const handleRefresh = () => { setRefreshing(true); qc.invalidateQueries(); setTimeout(() => setRefreshing(false), 800); };

  const handleTranslate = async (code: string) => {
    setLangOpen(false);
    setActiveLang(code);
    if (code === "en") {
      await translatePage("en");
      setProgress(null);
      return;
    }
    setTranslating(true);
    setProgress({ done: 0, total: 0 });
    try {
      await translatePage(code, (done, total) => {
        setProgress({ done, total });
      });
    } finally {
      setTranslating(false);
      setProgress(null);
    }
  };

  const fmt = (d: Date) => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  const dateFmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const currentLang = LANGUAGES.find(l => l.code === activeLang);

  return (
    <header className="sticky top-0 z-30 px-3 md:px-6 py-2.5 flex items-center justify-between" style={{ background: "#121212", borderBottom: "1px solid #4D4D4D" }}>
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <button onClick={onMenuToggle} className="lg:hidden p-1.5 rounded-md text-[#A6A6A6] hover:text-[#FFFFFF] transition-colors flex-shrink-0" aria-label="Open menu">
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="text-[13px] md:text-[14px] font-semibold text-[#FFFFFF] tracking-tight truncate">{title}</h1>
          {subtitle && <p className="text-[10px] md:text-[11px] text-[#A6A6A6] mt-0.5 hidden sm:block truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        <span className="hidden lg:block text-[11px] text-[#A6A6A6] tabular-nums" data-no-translate>{dateFmt(time)} · {fmt(time)}</span>
        <span className="hidden md:block text-[9px] text-[#A6A6A6] px-2 py-1 rounded-md" style={{ border: "1px solid #4D4D4D" }}>Seattle Metro</span>

        {/* ── Translate button — in-place translation, no external UI ── */}
        <div ref={langRef} className="relative" data-no-translate>
          <button
            onClick={() => setLangOpen(!langOpen)}
            aria-label="Translate page"
            aria-expanded={langOpen}
            disabled={translating}
            className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-lg transition-all text-[11px] font-medium disabled:opacity-75"
            style={langOpen || translating
              ? { background: "#FFFFFF", color: "#000000" }
              : { background: "#121212", color: "#D9D9D9", border: "1px solid #4D4D4D" }
            }
          >
            <RotatingGlobe size={15} />
            <span className="text-[11px]">
              {translating
                ? (progress && progress.total > 0
                    ? `Translating · ${Math.round((progress.done / progress.total) * 100)}%`
                    : "Translating…")
                : (activeLang === "en" ? "Translate" : (LANGUAGES.find(l => l.code === activeLang)?.name || "Translate"))}
            </span>
            <ChevronDown size={9} className={`transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
          </button>

          {langOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden shadow-2xl z-50"
              style={{ background: "#1C1C1C", border: "1px solid #4D4D4D" }}
              role="menu"
            >
              <div className="px-3 py-2 flex items-center justify-between" style={{ borderBottom: "1px solid #4D4D4D" }}>
                <span className="text-[9px] font-semibold text-[#A6A6A6] uppercase tracking-widest">Translate page</span>
                {activeLang !== "en" && (
                  <span className="text-[8px] bg-white/10 text-[#FFFFFF] px-1.5 py-0.5 rounded">Active: {currentLang?.name}</span>
                )}
              </div>
              <div className="max-h-[320px] overflow-y-auto py-1">
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => handleTranslate(l.code)}
                    role="menuitem"
                    className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors ${
                      activeLang === l.code
                        ? "bg-[#FFFFFF] text-[#000000]"
                        : "text-[#D9D9D9] hover:text-[#FFFFFF] hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-medium">{l.name}</span>
                    </div>
                    <span className="text-[10px] text-[#A6A6A6]">{l.native}</span>
                  </button>
                ))}
              </div>
              <div className="px-3 py-2 text-[8px] text-[#A6A6A6]" style={{ borderTop: "1px solid #4D4D4D" }}>
                Auto-translation · English original preserved
              </div>
            </div>
          )}
        </div>

        <button data-testid="button-refresh" onClick={handleRefresh} aria-label="Refresh data"
          className="p-1.5 rounded-md text-[#A6A6A6] hover:text-[#D9D9D9] transition-colors">
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>
    </header>
  );
}
