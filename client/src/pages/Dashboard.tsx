import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import SeattleMap from "@/components/SeattleMap";
import { SeverityBadge, StatusBadge } from "@/components/SeverityBadge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from "recharts";
import { X, ChevronRight, ExternalLink, Filter, Printer } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import type { Incident } from "@shared/schema";

const TEAL = "#000000";
const SEV: Record<string, string> = { fatal: "#000000", injury: "#4F4F4F", robbery: "#7A7A7A", assault: "#9E9E9E", policy: "#9E9E9E" };
const PLT: Record<string, string> = { Uber: "#000000", Lyft: "#4F4F4F", DoorDash: "#7A7A7A", "Amazon Flex": "#9E9E9E" };

function Num({ value, loading }: { value: number; loading: boolean }) {
  const [d, setD] = useState(0);
  const r = useRef<number | null>(null);
  useEffect(() => {
    if (loading || !value) return;
    const s = performance.now();
    const step = (n: number) => { const t = Math.min((n - s) / 550, 1); setD(Math.round(value * (1 - Math.pow(1 - t, 3)))); if (t < 1) r.current = requestAnimationFrame(step); };
    r.current = requestAnimationFrame(step);
    return () => { if (r.current) cancelAnimationFrame(r.current); };
  }, [value, loading]);
  if (loading) return <Skeleton className="h-7 w-8 inline-block" />;
  return <>{d}</>;
}

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="font-medium text-[#000000] mb-0.5">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-[10px]" style={{ color: p.color || p.fill }}>{p.name}: <span className="font-medium">{p.value}</span></p>
      ))}
    </div>
  );
};

function Modal({ incident: inc, onClose }: { incident: Incident; onClose: () => void }) {
  const c = SEV[inc.severity] ?? "#9E9E9E";
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(3px)" }} onClick={onClose}>
      <div className="bg-[#F7F7F7] rounded-lg border border-[#D1D1D1] p-5 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1"><SeverityBadge severity={inc.severity} /><StatusBadge status={inc.status} />
              {(inc.category === "policy_regulatory" || inc.category === "legal_sentencing") && <span className="text-[8px] bg-[#D1D1D1] text-[#4F4F4F] px-1.5 py-0.5 rounded">{inc.category === "policy_regulatory" ? "Policy" : "Legal"}</span>}
            </div>
            <div className="text-[13px] font-semibold text-[#000000]">{inc.type}</div>
            <div className="text-[12px] font-medium" style={{ color: TEAL }}>{inc.neighborhood}</div>
          </div>
          <button onClick={onClose} className="text-[#9E9E9E] hover:text-[#9E9E9E] p-1 rounded transition-colors"><X size={14} /></button>
        </div>
        <div className="space-y-2.5 text-[11px]">
          <div className="bg-[#F7F7F7] rounded p-3"><div className="section-label mb-1">Description</div><p className="text-[#000000] leading-relaxed">{inc.description}</p></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#F7F7F7] rounded p-2.5"><div className="section-label mb-0.5">Date</div><div className="tabular-nums text-[#000000]">{new Date(inc.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div></div>
            <div className="bg-[#F7F7F7] rounded p-2.5"><div className="section-label mb-0.5">Platform</div><div className="text-[#000000]">{inc.platform}</div></div>
          </div>
          {inc.victim && <div className="bg-[#F7F7F7] rounded p-2.5"><div className="section-label mb-0.5">Victim</div><div className="text-[#000000]">{inc.victim}</div></div>}
          <div className="bg-[#F7F7F7] rounded p-2.5"><div className="section-label mb-0.5">Location</div><div className="text-[#4F4F4F] text-[10px]">{inc.address}</div><div className="tabular-nums text-[9px] text-[#9E9E9E] mt-0.5">{inc.lat.toFixed(5)}, {inc.lng.toFixed(5)}</div></div>
          <div className="bg-[#F7F7F7] rounded p-2.5"><div className="section-label mb-0.5">Source</div>
            {inc.sourceUrl ? (
              <a href={inc.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-[10px] flex items-center gap-1" style={{ color: TEAL }}>{inc.source} <ExternalLink size={9} /></a>
            ) : <div className="text-[#4F4F4F]">{inc.source}</div>}
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className="flex-1 text-[11px] font-medium text-white py-2 rounded transition-opacity hover:opacity-90" style={{ background: TEAL }}>Close</button>
          <a href={`https://www.google.com/maps/search/?api=1&query=${inc.lat},${inc.lng}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-[#4F4F4F] hover:text-[#000000] bg-[#F7F7F7] border border-[#D1D1D1] px-3 py-2 rounded transition-colors">
            <ExternalLink size={10} /> Map
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [selectedId, setSelectedId]     = useState<number | null>(null);
  const [modal, setModal]               = useState<Incident | null>(null);
  const [sevFilter, setSevFilter]       = useState<string | null>(null);
  const [yearFilter, setYearFilter]     = useState("All");
  const [showHeatmap, setShowHeatmap]   = useState(false);

  const { data: incidents = [], isLoading: incL } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
    queryFn: () => apiRequest("GET", "/api/incidents").then(r => r.json()),
  });
  const { data: stats, isLoading: stL } = useQuery<any>({
    queryKey: ["/api/stats"],
    queryFn: () => apiRequest("GET", "/api/stats").then(r => r.json()),
  });

  const filtered = incidents.filter(i => {
    if (sevFilter && i.severity !== sevFilter) return false;
    if (yearFilter !== "All" && !i.date.startsWith(yearFilter)) return false;
    return true;
  });
  const years = ["All", ...Array.from(new Set(incidents.map(i => i.date.substring(0, 4)))).sort().reverse()];

  const sevData = stats ? [
    { name: "Fatal", value: Number(stats.fatal), color: SEV.fatal },
    { name: "Injury", value: Number(stats.injury), color: SEV.injury },
    { name: "Robbery", value: Number(stats.robbery), color: SEV.robbery },
    { name: "Assault", value: Number(stats.assault), color: SEV.assault },
  ] : [];
  const pltData = stats ? Object.entries(stats.byPlatform || {}).map(([n, v]) => ({ name: n, value: Number(v), fill: PLT[n] ?? "#D1D1D1" })).sort((a, b) => b.value - a.value) : [];
  const nbData = stats ? Object.entries(stats.byNeighborhood || {}).map(([n, v]) => ({ name: n, value: Number(v) })).sort((a, b) => b.value - a.value).slice(0, 8) : [];
  const moData = stats ? Object.entries(stats.byMonth || {}).sort(([a], [b]) => a.localeCompare(b)).map(([m, v]) => ({ month: new Date(m + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" }), incidents: Number(v) })) : [];

  const recent = filtered.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
  const toggleSev = (s: string) => { setSevFilter(p => p === s ? null : s); setSelectedId(null); };

  return (
    <Layout title="App-Based Driver Safety Steward" subtitle="App-Based Driver Safety Intelligence · Seattle Metro">
        <main className="flex-1 p-3 md:p-5 space-y-5">

          {(sevFilter || yearFilter !== "All") && (
            <div className="flex items-center gap-2 text-[10px] text-[#4F4F4F]">
              <Filter size={10} className="text-[#9E9E9E]" />
              {sevFilter && <button onClick={() => setSevFilter(null)} className="flex items-center gap-1 border border-[#D1D1D1] bg-[#F7F7F7] px-2 py-0.5 rounded hover:bg-[#D1D1D1]">{sevFilter} <X size={8} /></button>}
              {yearFilter !== "All" && <button onClick={() => setYearFilter("All")} className="flex items-center gap-1 border border-[#D1D1D1] bg-[#F7F7F7] px-2 py-0.5 rounded hover:bg-[#D1D1D1]">{yearFilter} <X size={8} /></button>}
              <button onClick={() => { setSevFilter(null); setYearFilter("All"); }} className="text-[#9E9E9E] hover:text-[#4F4F4F] ml-1">Clear</button>
            </div>
          )}

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="section-label mr-1">Year</span>
            {years.map(y => (
              <button key={y} onClick={() => setYearFilter(y)}
                className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${yearFilter === y ? "bg-[#000000] text-white border-transparent font-medium" : "bg-[#F7F7F7] border-[#D1D1D1] text-[#4F4F4F] hover:border-[#9E9E9E]"}`}>
                {y}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[10px] text-[#9E9E9E]">Heatmap</span>
              <button onClick={() => setShowHeatmap(h => !h)}
                className="w-7 h-3.5 rounded-full transition-colors relative border"
                style={{ background: showHeatmap ? TEAL : "#D1D1D1", borderColor: showHeatmap ? TEAL : "#9E9E9E" }}>
                <span className={`absolute top-px w-2.5 h-2.5 rounded-full bg-white shadow-sm transition-transform ${showHeatmap ? "left-3.5" : "left-0.5"}`} />
              </button>
              <span className="text-[10px] text-[#9E9E9E] tabular-nums">{filtered.length}</span>
            </div>
          </div>

          {/* KPIs — crime only, policy excluded */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {[
              { label: "Crime Total", value: stats?.crimeTotal ?? 0, color: "#000000", sev: null },
              { label: "Fatal", value: stats?.fatal ?? 0, color: SEV.fatal, sev: "fatal" },
              { label: "Injury", value: stats?.injury ?? 0, color: SEV.injury, sev: "injury" },
              { label: "Robbery", value: stats?.robbery ?? 0, color: SEV.robbery, sev: "robbery" },
              { label: "Assault", value: stats?.assault ?? 0, color: SEV.assault, sev: "assault" },
              { label: "Open", value: stats?.underInvestigation ?? 0, color: TEAL, sev: null },
            ].map(({ label, value, color, sev }) => (
              <div key={label} data-testid={`kpi-${label.toLowerCase().replace(/\s+/g,'-')}`}
                onClick={sev ? () => toggleSev(sev) : undefined}
                className={`kpi-card bg-[#F7F7F7] border border-[#D1D1D1] rounded-md p-4 ${sev ? "cursor-pointer" : ""} ${sevFilter === sev ? "active-filter" : ""}`}>
                <div className="text-[10px] font-medium text-[#9E9E9E] mb-1">{label}</div>
                <div className="tabular-nums text-[26px] font-semibold leading-none" style={{ color }}><Num value={value} loading={stL} /></div>
                {sev && sevFilter === sev && <div className="text-[8px] mt-1.5 font-medium" style={{ color: TEAL }}>Filtering ×</div>}
              </div>
            ))}
          </div>

          {(stats?.policyCount > 0 || stats?.legalCount > 0) && (
            <div className="text-[9px] text-[#9E9E9E]">
              + {(stats?.policyCount ?? 0) + (stats?.legalCount ?? 0)} non-crime entries tracked separately (policy/regulatory, legal/sentencing — not included in crime severity counts)
            </div>
          )}

          {/* Map + recent */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 bg-[#F7F7F7] border border-[#D1D1D1] rounded-md overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#D1D1D1]">
                <span className="text-[11px] font-medium text-[#000000]">Incident Map</span>
                <div className="flex items-center gap-3 text-[9px] text-[#9E9E9E]">
                  {Object.entries(SEV).filter(([k]) => k !== "policy").map(([k, v]) => (
                    <button key={k} onClick={() => toggleSev(k)}
                      className={`flex items-center gap-1 capitalize transition-opacity ${sevFilter && sevFilter !== k ? "opacity-25" : ""}`}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: v }} />{k}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-[280px] md:h-[320px]">
                <SeattleMap incidents={filtered.filter(i => i.category === "crime")} selectedId={selectedId}
                  onSelectIncident={id => { setSelectedId(id); const i = incidents.find(x => x.id === id); if (i) setModal(i); }}
                  showHeatmap={showHeatmap} height="100%" />
              </div>
            </div>

            <div className="bg-[#F7F7F7] border border-[#D1D1D1] rounded-md flex flex-col">
              <div className="px-4 py-2 border-b border-[#D1D1D1] flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#000000]">Recent</span>
                <span className="pulse-dot" />
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-[#D1D1D1]">
                {incL ? Array(5).fill(0).map((_, i) => <div key={i} className="px-4 py-3"><Skeleton className="h-3 w-full" /></div>) :
                  recent.map(inc => (
                    <div key={inc.id} data-testid={`incident-card-${inc.id}`}
                      onClick={() => { setSelectedId(inc.id!); setModal(inc); }}
                      className={`incident-row px-4 py-3 cursor-pointer hover:bg-[#F2F2F2] ${inc.id === selectedId ? "selected" : ""}`}>
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1">
                          <SeverityBadge severity={inc.severity} />
                          {(inc.category === "policy_regulatory" || inc.category === "legal_sentencing") && <span className="text-[7px] bg-[#D1D1D1] text-[#9E9E9E] px-1 rounded">{inc.category === "policy_regulatory" ? "Policy" : "Legal"}</span>}
                        </div>
                        <span className="text-[9px] text-[#9E9E9E] tabular-nums">{new Date(inc.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div><div className="text-[11px] font-medium text-[#000000]">{inc.type}</div><div className="text-[9px] text-[#4F4F4F]">{inc.neighborhood} · {inc.platform}</div></div>
                        <ChevronRight size={10} className="text-[#9E9E9E]" />
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="md:col-span-2 bg-[#F7F7F7] border border-[#D1D1D1] rounded-md p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-medium text-[#000000]">Monthly Trend (crime only)</span>
                <span className="text-[9px] text-[#9E9E9E]">Jan 2024 – Present</span>
              </div>
              <ResponsiveContainer width="100%" height={130}>
                <LineChart data={moData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D1D1D1" />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: "#9E9E9E" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#9E9E9E" }} axisLine={false} tickLine={false} width={18} />
                  <Tooltip content={<Tip />} />
                  <Line type="monotone" dataKey="incidents" stroke="#000000" strokeWidth={1.5} dot={{ fill: "#000000", r: 2.5, strokeWidth: 0 }} activeDot={{ r: 4, fill: "#000000", stroke: "#F7F7F7", strokeWidth: 1.5 }} name="Incidents" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-[#F7F7F7] border border-[#D1D1D1] rounded-md p-4">
              <span className="text-[11px] font-medium text-[#000000]">By Severity</span>
              <ResponsiveContainer width="100%" height={90} className="mt-2">
                <PieChart><Pie data={sevData} cx="50%" cy="50%" innerRadius={28} outerRadius={44} dataKey="value" paddingAngle={2} onClick={d => toggleSev(d.name.toLowerCase())} style={{ cursor: "pointer" }}>
                  {sevData.map((e, i) => <Cell key={i} fill={e.color} opacity={sevFilter && sevFilter !== e.name.toLowerCase() ? 0.2 : 0.8} />)}
                </Pie><Tooltip content={<Tip />} /></PieChart>
              </ResponsiveContainer>
              <div className="mt-1 space-y-px">
                {sevData.map(d => (
                  <button key={d.name} onClick={() => toggleSev(d.name.toLowerCase())} className="w-full flex items-center justify-between text-[9px] py-0.5 px-1 rounded hover:bg-[#F2F2F2]">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: d.color }} /><span className="text-[#4F4F4F]">{d.name}</span></span>
                    <span className="tabular-nums font-medium text-[#000000]">{d.value}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#F7F7F7] border border-[#D1D1D1] rounded-md p-4">
              <span className="text-[11px] font-medium text-[#000000]">By Platform</span>
              <ResponsiveContainer width="100%" height={90} className="mt-2">
                <BarChart data={pltData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 8, fill: "#9E9E9E" }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: "#9E9E9E" }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="value" radius={[0, 2, 2, 0]}>{pltData.map((e, i) => <Cell key={i} fill={e.fill} opacity={0.7} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Neighborhoods */}
          <div className="bg-[#F7F7F7] border border-[#D1D1D1] rounded-md p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-medium text-[#000000]">Hotspot Neighborhoods</span>
              <span className="text-[9px] text-[#9E9E9E]">Crime incidents only</span>
            </div>
            <div className="space-y-2.5">
              {nbData.map((n, i) => {
                const max = nbData[0]?.value ?? 1;
                const pct = Math.round((n.value / max) * 100);
                return (
                  <div key={n.name}>
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className={i === 0 ? "font-medium text-[#000000]" : "text-[#4F4F4F]"}>{n.name}</span>
                      <span className="tabular-nums font-medium" style={{ color: i === 0 ? SEV.fatal : "#9E9E9E" }}>{n.value}</span>
                    </div>
                    <div className="h-1 rounded-full bg-[#D1D1D1]">
                      <div className="h-full rounded-full bar-fill" style={{ "--target-width": `${pct}%`, width: `${pct}%`, background: i === 0 ? SEV.fatal : "#9E9E9E" } as any} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Table with source links */}
          <div className="bg-[#F7F7F7] border border-[#D1D1D1] rounded-md overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[#D1D1D1] flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#000000]">All Incidents <span className="text-[#9E9E9E] tabular-nums font-normal ml-1">{filtered.length}</span></span>
              <span className="text-[9px] text-[#9E9E9E]">Click row for details · linked sources open in new tab</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] min-w-[600px]">
                <thead>
                  <tr className="bg-[#F2F2F2] border-b border-[#D1D1D1]">
                    {["Date", "Type", "Category", "Severity", "Neighborhood", "Platform", "Status", "Source"].map(h => (
                      <th key={h} className="px-4 py-2 text-left text-[9px] font-medium text-[#9E9E9E] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D1D1D1]">
                  {incL ? Array(4).fill(0).map((_, i) => <tr key={i}>{Array(8).fill(0).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-3 w-14" /></td>)}</tr>)
                    : filtered.slice().sort((a, b) => b.date.localeCompare(a.date)).map(inc => (
                      <tr key={inc.id} data-testid={`row-incident-${inc.id}`}
                        onClick={() => { setSelectedId(inc.id!); setModal(inc); }}
                        className={`incident-row cursor-pointer hover:bg-[#F2F2F2] transition-colors ${inc.id === selectedId ? "selected" : ""}`}>
                        <td className="px-4 py-2.5 tabular-nums text-[#4F4F4F] whitespace-nowrap">{new Date(inc.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                        <td className="px-4 py-2.5 font-medium text-[#000000] max-w-[120px] truncate">{inc.type}</td>
                        <td className="px-4 py-2.5 text-[9px] text-[#4F4F4F]">{inc.category === "policy_regulatory" ? "Policy" : inc.category === "legal_sentencing" ? "Legal" : "Crime"}</td>
                        <td className="px-4 py-2.5"><SeverityBadge severity={inc.severity} /></td>
                        <td className="px-4 py-2.5 text-[#4F4F4F] max-w-[120px] truncate">{inc.neighborhood}</td>
                        <td className="px-4 py-2.5 text-[#4F4F4F]">{inc.platform}</td>
                        <td className="px-4 py-2.5"><StatusBadge status={inc.status} /></td>
                        <td className="px-4 py-2.5 max-w-[130px] truncate">
                          {inc.sourceUrl ? (
                            <a href={inc.sourceUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                              className="hover:underline text-[9px] flex items-center gap-0.5" style={{ color: TEAL }}>{inc.source} <ExternalLink size={8} /></a>
                          ) : <span className="text-[#9E9E9E] text-[9px]">{inc.source}</span>}
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-[9px] text-[#9E9E9E] pb-2 space-y-1">
            <div className="flex items-center justify-between">
              <span>bullecloud.com</span>
              <div className="flex items-center gap-2">
                <span>Data sources last verified: {stats?.lastVerified ?? "—"}</span>
                <button onClick={() => window.print()} className="btn-secondary flex items-center gap-1.5" data-testid="btn-print">
                  <Printer size={11} /> Print Report
                </button>
              </div>
            </div>
            <div className="text-[8px] text-[#9E9E9E] leading-relaxed">
              Incidents sourced from SPD Blotter are based on general crime data. Individual rideshare connection may not be independently verified for all entries.
            </div>
          </div>
        </main>
      {modal && <Modal incident={modal} onClose={() => { setModal(null); setSelectedId(null); }} />}
    </Layout>
  );
}
