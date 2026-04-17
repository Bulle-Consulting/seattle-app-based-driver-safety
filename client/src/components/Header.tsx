import { RefreshCw, Languages } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface HeaderProps { title: string; subtitle?: string; }

const LANGUAGES = [
  { label: "English", code: "en" },
  { label: "Somali", code: "so" },
  { label: "Amharic", code: "am" },
  { label: "Tigrinya", code: "ti" },
  { label: "Oromiffa", code: "om" },
  { label: "Tagalog", code: "tl" },
  { label: "Spanish", code: "es" },
  { label: "Vietnamese", code: "vi" },
  { label: "Chinese (Simplified)", code: "zh-CN" },
  { label: "Farsi", code: "fa" },
  { label: "Pashto", code: "ps" },
  { label: "Arabic", code: "ar" },
];

export default function Header({ title, subtitle }: HeaderProps) {
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    if (langOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [langOpen]);

  const handleRefresh = () => { setRefreshing(true); qc.invalidateQueries(); setTimeout(() => setRefreshing(false), 800); };
  const fmt = (d: Date) => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  const dateFmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const handleLanguage = (code: string) => {
    setLangOpen(false);
    if (code === "en") return;
    window.open(
      `https://translate.google.com/translate?sl=en&tl=${code}&u=${encodeURIComponent(window.location.href)}`,
      "_blank"
    );
  };

  return (
    <header className="sticky top-0 z-30 bg-[#1e293b] border-b border-[#334155] px-5 py-2.5 flex items-center justify-between">
      <div>
        <h1 className="text-[13px] font-semibold text-[#e2e8f0]">{title}</h1>
        {subtitle && <p className="text-[10px] text-[#94a3b8] mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden md:block text-[10px] text-[#64748b] tabular-nums">{dateFmt(time)} · {fmt(time)}</span>
        <span className="hidden sm:block text-[8px] text-[#64748b] border border-[#334155] px-2 py-1 rounded">Seattle Metro · 2024–Present</span>

        {/* Translation dropdown */}
        <div className="relative" ref={langRef}>
          <button
            data-testid="button-translate"
            onClick={() => setLangOpen(o => !o)}
            className="p-1.5 rounded text-[#64748b] hover:text-[#94a3b8] transition-colors"
            title="Translate page"
          >
            <Languages size={11} />
          </button>
          {langOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-md border border-[#334155] bg-[#1e293b] shadow-lg overflow-hidden">
              {LANGUAGES.map(({ label, code }) => (
                <button
                  key={code}
                  onClick={() => handleLanguage(code)}
                  className="w-full text-left px-3 py-1.5 text-[11px] text-[#cbd5e1] hover:bg-[#334155] hover:text-[#e2e8f0] transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button data-testid="button-refresh" onClick={handleRefresh} className="p-1.5 rounded text-[#64748b] hover:text-[#94a3b8] transition-colors">
          <RefreshCw size={11} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>
    </header>
  );
}
