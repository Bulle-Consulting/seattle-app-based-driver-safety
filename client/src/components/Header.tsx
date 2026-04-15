import { RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface HeaderProps { title: string; subtitle?: string; }

export default function Header({ title, subtitle }: HeaderProps) {
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const qc = useQueryClient();

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  const handleRefresh = () => { setRefreshing(true); qc.invalidateQueries(); setTimeout(() => setRefreshing(false), 800); };
  const fmt = (d: Date) => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  const dateFmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#D3E0E8] px-5 py-2.5 flex items-center justify-between">
      <div>
        <h1 className="text-[13px] font-semibold text-[#231F20]">{title}</h1>
        {subtitle && <p className="text-[10px] text-[#939598] mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden md:block text-[10px] text-[#B5B8BC] tabular-nums">{dateFmt(time)} · {fmt(time)}</span>
        <span className="hidden sm:block text-[8px] text-[#939598] border border-[#D3E0E8] px-2 py-1 rounded">Seattle Metro · 2024–Present</span>
        <button data-testid="button-refresh" onClick={handleRefresh} className="p-1.5 rounded text-[#B5B8BC] hover:text-[#939598] transition-colors">
          <RefreshCw size={11} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>
    </header>
  );
}
