import { RefreshCw, Languages, ChevronDown } from "lucide-react";
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
  { code: "zh-CN", name: "Chinese" },
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
    <header className="sticky top-0 z-30 px-6 py-3 flex items-center justify-between" style={{ background: "hsl(220 40% 9%)", borderBottom: "1px solid hsl(220 25% 16%)" }}>
      <div>
        <h1 className="text-[14px] font-semibold text-[#F5F5F5] tracking-tight">{title}</h1>
        {subtitle && <p className="text-[10.5px] text-[#4D5666] mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden md:block text-[10px] text-[#4D5666] tabular-nums">{dateFmt(time)} · {fmt(time)}</span>
        <span className="hidden sm:block text-[9px] text-[#4D5666] px-2.5 py-1 rounded-md" style={{ border: "1px solid hsl(220 25% 16%)" }}>Seattle Metro · 2024–Present</span>

        {/* Language dropdown */}
        <div ref={langRef} className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1 p-1.5 rounded-md transition-colors text-[#4D5666] hover:text-[#A3AEC0]"
            title="Translate page"
            style={langOpen ? { background: "hsl(220 35% 12%)", color: "#A3AEC0" } : {}}
          >
            <Languages size={13} />
            <ChevronDown size={9} />
          </button>
          {langOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 rounded-lg overflow-hidden shadow-2xl" style={{ background: "hsl(220 35% 12%)", border: "1px solid hsl(220 25% 18%)" }}>
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => translate(l.code)}
                  className="w-full text-left px-3 py-2 text-[11px] text-[#A3AEC0] hover:text-[#F5F5F5] hover:bg-white/[0.04] transition-colors">
                  {l.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <button data-testid="button-refresh" onClick={handleRefresh}
          className="p-1.5 rounded-md text-[#4D5666] hover:text-[#A3AEC0] transition-colors">
          <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>
    </header>
  );
}
