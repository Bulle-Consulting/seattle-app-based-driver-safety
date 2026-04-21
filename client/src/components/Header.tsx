import { RefreshCw, ChevronDown, Menu } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

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
  const [activeLang, setActiveLang] = useState("en");
  const langRef = useRef<HTMLDivElement>(null);
  const gtInitRef = useRef(false);
  const qc = useQueryClient();

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  /* Initialize Google Translate widget once */
  useEffect(() => {
    if (gtInitRef.current) return;
    gtInitRef.current = true;

    // Create hidden container for Google Translate
    const container = document.createElement("div");
    container.id = "google_translate_element";
    container.style.display = "none";
    document.body.appendChild(container);

    // Define the init callback
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        { pageLanguage: "en", autoDisplay: false },
        "google_translate_element"
      );
    };

    // Load Google Translate script
    const script = document.createElement("script");
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.head.appendChild(script);
  }, []);

  const handleRefresh = () => { setRefreshing(true); qc.invalidateQueries(); setTimeout(() => setRefreshing(false), 800); };

  const translatePage = (code: string) => {
    setActiveLang(code);
    setLangOpen(false);

    if (code === "en") {
      // Reset to English — remove Google Translate frame
      const frame = document.querySelector(".goog-te-banner-frame") as HTMLElement;
      if (frame) frame.style.display = "none";
      // Try to restore original
      const sel = document.querySelector(".goog-te-combo") as HTMLSelectElement;
      if (sel) { sel.value = ""; sel.dispatchEvent(new Event("change")); }
      // Also try cookie reset
      document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "googtrans=; path=/; domain=" + window.location.hostname + "; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.location.reload();
      return;
    }

    // Try in-page Google Translate first
    const sel = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (sel) {
      sel.value = code;
      sel.dispatchEvent(new Event("change"));
    } else {
      // Fallback: open Google Translate in new tab
      const baseUrl = window.location.href.split("#")[0];
      window.open(`https://translate.google.com/translate?sl=en&tl=${code}&u=${encodeURIComponent(baseUrl)}`, "_blank");
    }
  };

  const fmt = (d: Date) => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  const dateFmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const currentLang = LANGUAGES.find(l => l.code === activeLang);

  return (
    <header className="sticky top-0 z-30 px-3 md:px-6 py-2.5 flex items-center justify-between" style={{ background: "#F7F7F7", borderBottom: "1px solid #D1D1D1" }}>
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <button onClick={onMenuToggle} className="lg:hidden p-1.5 rounded-md text-[#9E9E9E] hover:text-[#000000] transition-colors flex-shrink-0" aria-label="Open menu">
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="text-[13px] md:text-[14px] font-semibold text-[#000000] tracking-tight truncate">{title}</h1>
          {subtitle && <p className="text-[10px] md:text-[11px] text-[#9E9E9E] mt-0.5 hidden sm:block truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        <span className="hidden lg:block text-[11px] text-[#9E9E9E] tabular-nums">{dateFmt(time)} · {fmt(time)}</span>
        <span className="hidden md:block text-[9px] text-[#9E9E9E] px-2 py-1 rounded-md" style={{ border: "1px solid #D1D1D1" }}>Seattle Metro</span>

        {/* ── Translate button — always visible with rotating globe ── */}
        <div ref={langRef} className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            aria-label="Translate page"
            aria-expanded={langOpen}
            className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-lg transition-all text-[11px] font-medium"
            style={langOpen
              ? { background: "#000000", color: "white" }
              : { background: "#F7F7F7", color: "#4F4F4F", border: "1px solid #D1D1D1" }
            }
          >
            <RotatingGlobe size={15} />
            <span className="text-[11px]">Translate</span>
            <ChevronDown size={9} className={`transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
          </button>

          {langOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden shadow-2xl z-50"
              style={{ background: "#FFFFFF", border: "1px solid #D1D1D1" }}
              role="menu"
            >
              <div className="px-3 py-2 flex items-center justify-between" style={{ borderBottom: "1px solid #D1D1D1" }}>
                <span className="text-[9px] font-semibold text-[#9E9E9E] uppercase tracking-widest">Translate page</span>
                {activeLang !== "en" && (
                  <span className="text-[8px] bg-[#000000]/20 text-[#000000] px-1.5 py-0.5 rounded">Active: {currentLang?.name}</span>
                )}
              </div>
              <div className="max-h-[320px] overflow-y-auto py-1">
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => translatePage(l.code)}
                    role="menuitem"
                    className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors ${
                      activeLang === l.code
                        ? "bg-[#000000] text-white"
                        : "text-[#4F4F4F] hover:text-[#000000] hover:bg-black/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-medium">{l.name}</span>
                    </div>
                    <span className="text-[10px] text-[#9E9E9E]">{l.native}</span>
                  </button>
                ))}
              </div>
              <div className="px-3 py-2 text-[8px] text-[#9E9E9E]" style={{ borderTop: "1px solid #D1D1D1" }}>
                Powered by Google Translate
              </div>
            </div>
          )}
        </div>

        <button data-testid="button-refresh" onClick={handleRefresh} aria-label="Refresh data"
          className="p-1.5 rounded-md text-[#9E9E9E] hover:text-[#4F4F4F] transition-colors">
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>
    </header>
  );
}
