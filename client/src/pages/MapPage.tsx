import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import SeattleMap from "@/components/SeattleMap";
import { SeverityBadge, StatusBadge } from "@/components/SeverityBadge";
import { useState } from "react";
import { X, ExternalLink } from "lucide-react";
import type { Incident } from "@shared/schema";

const ACCENT = "#FFFFFF";
const SEV: Record<string, string> = { fatal: "#FFFFFF", injury: "#D9D9D9", robbery: "#8C8C8C", assault: "#A6A6A6" };
const PLATFORMS = ["All", "Uber", "Lyft", "DoorDash", "Amazon Flex"];
const SEVERITIES = ["All", "fatal", "injury", "robbery", "assault"];

function Btn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`text-[10px] px-2 py-0.5 rounded border transition-colors capitalize ${active ? "bg-[#FFFFFF] text-[#000000] border-transparent font-medium" : "bg-[#121212] border-[#4D4D4D] text-[#D9D9D9] hover:border-[#808080]"}`}>
      {label}
    </button>
  );
}

export default function MapPage() {
  const [heatmap, setHeatmap]  = useState(false);
  const [selId, setSelId]      = useState<number | null>(null);
  const [fPlat, setFPlat]      = useState("All");
  const [fSev, setFSev]        = useState("All");

  const { data: incidents = [] } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
    queryFn: () => apiRequest("GET", "/api/incidents").then(r => r.json()),
  });

  const filtered = incidents.filter(i => {
    if (fPlat !== "All" && i.platform !== fPlat) return false;
    if (fSev !== "All" && i.severity !== fSev) return false;
    return true;
  });
  const sel = incidents.find(i => i.id === selId);

  return (
    <Layout title="Crime Map" subtitle="Interactive Incident Map · Seattle Metro">
        <main className="flex-1 p-3 md:p-4 flex flex-col gap-3" style={{ minHeight: 0 }}>

          <div className="bg-[#121212] border border-[#4D4D4D] rounded-md px-4 py-2.5 flex items-center gap-3 flex-wrap">
            <span className="section-label">Platform</span>
            <div className="flex gap-1">{PLATFORMS.map(p => <Btn key={p} label={p} active={fPlat === p} onClick={() => setFPlat(p)} />)}</div>
            <div className="w-px h-4 bg-[#333333] mx-1" />
            <span className="section-label">Severity</span>
            <div className="flex gap-1">{SEVERITIES.map(s => <Btn key={s} label={s} active={fSev === s} onClick={() => setFSev(s)} />)}</div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[10px] text-[#A6A6A6]">Heatmap</span>
              <button onClick={() => setHeatmap(h => !h)}
                className="w-7 h-3.5 rounded-full transition-colors relative border"
                style={{ background: heatmap ? ACCENT : "#4D4D4D", borderColor: heatmap ? ACCENT : "#A6A6A6" }}>
                <span className={`absolute top-px w-2.5 h-2.5 rounded-full bg-white shadow-sm transition-transform ${heatmap ? "left-3.5" : "left-0.5"}`} />
              </button>
              <span className="text-[10px] text-[#A6A6A6] tabular-nums">{filtered.length}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 flex-1" style={{ minHeight: 0 }}>
            <div className="xl:col-span-2 bg-[#121212] border border-[#4D4D4D] rounded-md overflow-hidden">
              <div className="h-[300px] md:h-[400px]">
                <SeattleMap incidents={filtered} selectedId={selId} onSelectIncident={setSelId} showHeatmap={heatmap} height="100%" />
              </div>
            </div>

            <div className="bg-[#121212] border border-[#4D4D4D] rounded-md flex flex-col overflow-hidden" style={{ minHeight: 0 }}>
              {sel ? (
                <div className="p-4 overflow-y-auto">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1"><SeverityBadge severity={sel.severity} /><StatusBadge status={sel.status} /></div>
                      <div className="text-[12px] font-semibold text-[#FFFFFF]">{sel.type}</div>
                      <div className="text-[11px] font-medium" style={{ color: ACCENT }}>{sel.neighborhood}</div>
                    </div>
                    <button onClick={() => setSelId(null)} className="text-[#A6A6A6] hover:text-[#A6A6A6] p-1"><X size={12} /></button>
                  </div>
                  <div className="space-y-2 text-[10px]">
                    <div className="bg-[#121212] rounded p-2.5"><div className="section-label mb-0.5">Description</div><p className="text-[#FFFFFF] leading-relaxed">{sel.description}</p></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#121212] rounded p-2"><div className="section-label mb-0.5">Date</div><div className="tabular-nums text-[#FFFFFF]">{new Date(sel.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div></div>
                      <div className="bg-[#121212] rounded p-2"><div className="section-label mb-0.5">Platform</div><div className="text-[#FFFFFF]">{sel.platform}</div></div>
                    </div>
                    {sel.victim && <div className="bg-[#121212] rounded p-2"><div className="section-label mb-0.5">Victim</div><div className="text-[#FFFFFF]">{sel.victim}</div></div>}
                    <div className="bg-[#121212] rounded p-2"><div className="section-label mb-0.5">Address</div><div className="text-[#D9D9D9]">{sel.address}</div></div>
                    <div className="bg-[#121212] rounded p-2"><div className="section-label mb-0.5">Source</div><div className="text-[#D9D9D9]">{sel.source}</div></div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => setSelId(null)} className="flex-1 text-[10px] font-medium text-[#000000] py-1.5 rounded" style={{ background: ACCENT }}>Clear</button>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${sel.lat},${sel.lng}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[9px] text-[#D9D9D9] bg-[#121212] border border-[#4D4D4D] px-2.5 py-1.5 rounded"><ExternalLink size={9} /> Map</a>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
                  <div className="px-4 py-2 border-b border-[#4D4D4D] text-[10px] text-[#A6A6A6]">Click a pin for details</div>
                  <div className="flex-1 overflow-y-auto divide-y divide-[#4D4D4D]">
                    {filtered.slice().sort((a, b) => b.date.localeCompare(a.date)).map(inc => (
                      <div key={inc.id} onClick={() => setSelId(inc.id!)} className="px-4 py-2.5 cursor-pointer hover:bg-white/[0.06] transition-colors">
                        <div className="flex items-center justify-between mb-0.5"><SeverityBadge severity={inc.severity} /><span className="text-[8px] text-[#A6A6A6] tabular-nums">{new Date(inc.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span></div>
                        <div className="text-[10px] font-medium text-[#FFFFFF]">{inc.neighborhood}</div>
                        <div className="text-[9px] text-[#D9D9D9]">{inc.type} · {inc.platform}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#121212] border border-[#4D4D4D] rounded-md px-4 py-2 flex items-center gap-4 text-[9px] text-[#A6A6A6]">
            <span className="font-medium text-[#D9D9D9]">Legend</span>
            {Object.entries(SEV).map(([k, v]) => (
              <span key={k} className="flex items-center gap-1 capitalize"><span className="w-1.5 h-1.5 rounded-full" style={{ background: v }} />{k}</span>
            ))}
          </div>
        </main>
    </Layout>
  );
}
