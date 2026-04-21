import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import SeattleMap from "@/components/SeattleMap";
import { SeverityBadge, StatusBadge } from "@/components/SeverityBadge";
import { useState } from "react";
import { X, ExternalLink } from "lucide-react";
import type { Incident } from "@shared/schema";

const TEAL = "#2563EB";
const SEV: Record<string, string> = { fatal: "#000000", injury: "#4F4F4F", robbery: "#7A7A7A", assault: "#9E9E9E" };
const PLATFORMS = ["All", "Uber", "Lyft", "DoorDash", "Amazon Flex"];
const SEVERITIES = ["All", "fatal", "injury", "robbery", "assault"];

function Btn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`text-[10px] px-2 py-0.5 rounded border transition-colors capitalize ${active ? "bg-[#2563EB] text-white border-transparent font-medium" : "bg-[#F7F7F7] border-[#D1D1D1] text-[#4F4F4F] hover:border-[#9E9E9E]"}`}>
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

          <div className="bg-[#F7F7F7] border border-[#D1D1D1] rounded-md px-4 py-2.5 flex items-center gap-3 flex-wrap">
            <span className="section-label">Platform</span>
            <div className="flex gap-1">{PLATFORMS.map(p => <Btn key={p} label={p} active={fPlat === p} onClick={() => setFPlat(p)} />)}</div>
            <div className="w-px h-4 bg-[#D1D1D1] mx-1" />
            <span className="section-label">Severity</span>
            <div className="flex gap-1">{SEVERITIES.map(s => <Btn key={s} label={s} active={fSev === s} onClick={() => setFSev(s)} />)}</div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[10px] text-[#9E9E9E]">Heatmap</span>
              <button onClick={() => setHeatmap(h => !h)}
                className="w-7 h-3.5 rounded-full transition-colors relative border"
                style={{ background: heatmap ? TEAL : "#D1D1D1", borderColor: heatmap ? TEAL : "#9E9E9E" }}>
                <span className={`absolute top-px w-2.5 h-2.5 rounded-full bg-white shadow-sm transition-transform ${heatmap ? "left-3.5" : "left-0.5"}`} />
              </button>
              <span className="text-[10px] text-[#9E9E9E] tabular-nums">{filtered.length}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 flex-1" style={{ minHeight: 0 }}>
            <div className="xl:col-span-2 bg-[#F7F7F7] border border-[#D1D1D1] rounded-md overflow-hidden">
              <div className="h-[300px] md:h-[400px]">
                <SeattleMap incidents={filtered} selectedId={selId} onSelectIncident={setSelId} showHeatmap={heatmap} height="100%" />
              </div>
            </div>

            <div className="bg-[#F7F7F7] border border-[#D1D1D1] rounded-md flex flex-col overflow-hidden" style={{ minHeight: 0 }}>
              {sel ? (
                <div className="p-4 overflow-y-auto">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1"><SeverityBadge severity={sel.severity} /><StatusBadge status={sel.status} /></div>
                      <div className="text-[12px] font-semibold text-[#000000]">{sel.type}</div>
                      <div className="text-[11px] font-medium" style={{ color: TEAL }}>{sel.neighborhood}</div>
                    </div>
                    <button onClick={() => setSelId(null)} className="text-[#9E9E9E] hover:text-[#9E9E9E] p-1"><X size={12} /></button>
                  </div>
                  <div className="space-y-2 text-[10px]">
                    <div className="bg-[#F7F7F7] rounded p-2.5"><div className="section-label mb-0.5">Description</div><p className="text-[#000000] leading-relaxed">{sel.description}</p></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#F7F7F7] rounded p-2"><div className="section-label mb-0.5">Date</div><div className="tabular-nums text-[#000000]">{new Date(sel.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div></div>
                      <div className="bg-[#F7F7F7] rounded p-2"><div className="section-label mb-0.5">Platform</div><div className="text-[#000000]">{sel.platform}</div></div>
                    </div>
                    {sel.victim && <div className="bg-[#F7F7F7] rounded p-2"><div className="section-label mb-0.5">Victim</div><div className="text-[#000000]">{sel.victim}</div></div>}
                    <div className="bg-[#F7F7F7] rounded p-2"><div className="section-label mb-0.5">Address</div><div className="text-[#4F4F4F]">{sel.address}</div></div>
                    <div className="bg-[#F7F7F7] rounded p-2"><div className="section-label mb-0.5">Source</div><div className="text-[#4F4F4F]">{sel.source}</div></div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => setSelId(null)} className="flex-1 text-[10px] font-medium text-white py-1.5 rounded" style={{ background: TEAL }}>Clear</button>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${sel.lat},${sel.lng}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[9px] text-[#4F4F4F] bg-[#F7F7F7] border border-[#D1D1D1] px-2.5 py-1.5 rounded"><ExternalLink size={9} /> Map</a>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
                  <div className="px-4 py-2 border-b border-[#D1D1D1] text-[10px] text-[#9E9E9E]">Click a pin for details</div>
                  <div className="flex-1 overflow-y-auto divide-y divide-[#D1D1D1]">
                    {filtered.slice().sort((a, b) => b.date.localeCompare(a.date)).map(inc => (
                      <div key={inc.id} onClick={() => setSelId(inc.id!)} className="px-4 py-2.5 cursor-pointer hover:bg-[#F2F2F2] transition-colors">
                        <div className="flex items-center justify-between mb-0.5"><SeverityBadge severity={inc.severity} /><span className="text-[8px] text-[#9E9E9E] tabular-nums">{new Date(inc.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span></div>
                        <div className="text-[10px] font-medium text-[#000000]">{inc.neighborhood}</div>
                        <div className="text-[9px] text-[#4F4F4F]">{inc.type} · {inc.platform}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#F7F7F7] border border-[#D1D1D1] rounded-md px-4 py-2 flex items-center gap-4 text-[9px] text-[#9E9E9E]">
            <span className="font-medium text-[#4F4F4F]">Legend</span>
            {Object.entries(SEV).map(([k, v]) => (
              <span key={k} className="flex items-center gap-1 capitalize"><span className="w-1.5 h-1.5 rounded-full" style={{ background: v }} />{k}</span>
            ))}
          </div>
        </main>
    </Layout>
  );
}
