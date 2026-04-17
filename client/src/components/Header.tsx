import { RefreshCw, Globe, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "so", name: "Somali" },
  { code: "am", name: "Amharic" },
  { code: "ti", name: "Tigrinya" },
  { code: "om", name: "Oromiffa" },
  { code: "tl", name: "Tagalog" },
  { code: "es", name: "Spanish" },
  { code: "vi", name: "Vietnamese" },
  { code: "zh-CN", name: "Chinese (Simplified)" },
  { code: "fa", name: "Farsi" },
  { code: "ps", name: "Pashto" },
  { code: "ar", name: "Arabic" },
];

interface HeaderProps { title: string; subtitle?: string; }

export default function Header({ title, subtitle }: HeaderProps) {
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handleRefresh = () => { setRefreshing(true); qc.invalidateQueries(); setTimeout(() => setRefreshing(false), 800); };
  const translate = (code: string) => {
    if (code === "en") return;
    window.open(`https://translate.google.com/translate?sl=en&tl=${code}&u=${encodeURIComponent(window.location.href)}`, "_blank");
    setLangOpen(false);
  };

  const fmt = (d: Date) => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  const dateFmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <header className="sticky top-0 z-30 px-6 py-3 flex items-center justify-between" style={{ background: "hsl(220 40% 9%)", borderBottom: "1px solid hsl(220 25% 18%)" }}>
      <div>
        <h1 className="text-[14px] font-semibold text-[#F5F5F5] tracking-tight">{title}</h1>
        {subtitle && <p className="text-[11px] text-[#8B95A8] mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden md:block text-[11px] text-[#8B95A8] tabular-nums">{dateFmt(time)} · {fmt(time)}</span>
        <span className="hidden sm:block text-[10px] text-[#8B95A8] px-2.5 py-1 rounded-md" style={{ border: "1px solid hsl(220 25% 18%)" }}>Seattle Metro · 2024–Present</span>

        {/* ── Translate dropdown — prominent ── */}
        <div ref={langRef} className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            aria-label="Translate page"
            aria-expanded={langOpen}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all text-[11px] font-medium"
            style={langOpen
              ? { background: "hsl(176 65% 42%)", color: "white" }
              : { background: "hsl(220 30% 15%)", color: "#C0C8D8", border: "1px solid hsl(220 25% 18%)" }
            }
          >
            <Globe size={13} />
            <span className="hidden sm:inline">Translate</span>
            <ChevronDown size={10} className={`transition-transform ${langOpen ? "rotate-180" : ""}`} />
          </button>
          {langOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-48 rounded-lg overflow-hidden shadow-2xl"
              style={{ background: "hsl(220 35% 13%)", border: "1px solid hsl(220 25% 20%)" }}
              role="menu"
            >
              <div className="px-3 py-2 text-[10px] font-medium text-[#8B95A8] uppercase tracking-wider" style={{ borderBottom: "1px solid hsl(220 25% 18%)" }}>
                Select language
              </div>
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => translate(l.code)} role="menuitem"
                  className="w-full text-left px-3 py-2.5 text-[12px] text-[#C0C8D8] hover:text-white hover:bg-white/[0.06] transition-colors"
                  style={l.code === "en" ? { color: "#26A69A", fontWeight: 500 } : {}}>
                  {l.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <button data-testid="button-refresh" onClick={handleRefresh} aria-label="Refresh data"
          className="p-1.5 rounded-md text-[#8B95A8] hover:text-[#C0C8D8] transition-colors">
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>
    </header>
  );
}
