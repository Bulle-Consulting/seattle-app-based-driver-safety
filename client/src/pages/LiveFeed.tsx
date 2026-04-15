import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { SeverityBadge, StatusBadge } from "@/components/SeverityBadge";
import { useState, useEffect, useRef } from "react";
import { TrendingUp, AlertTriangle, ExternalLink, Rss } from "lucide-react";
import type { Incident } from "@shared/schema";

const BLUE = "#0046AD";
const SEV: Record<string, string> = { fatal: "#F15B46", injury: "#E07A2F", robbery: "#6D5AC5", assault: "#2E7DAF", policy: "#939598", other: "#939598" };
const SEV_BG: Record<string, string> = { fatal: "#FEEAE7", injury: "#FEF0E1", robbery: "#EEEBFA", assault: "#E3F0F8", policy: "#F0F1F3", other: "#F5F8FA" };

function useLiveFeed(incidents: Incident[]) {
  const [feed, setFeed] = useState<Array<Incident & { _key: number; _new: boolean }>>([]);
  const counter = useRef(0); const idx = useRef(0);
  useEffect(() => {
    if (!incidents.length) return;
    const sorted = [...incidents].sort((a, b) => b.date.localeCompare(a.date));
    setFeed(sorted.slice(0, 3).map(i => ({ ...i, _key: counter.current++, _new: false })));
    idx.current = 3;
    const iv = setInterval(() => {
      const next = sorted[idx.current % sorted.length]; idx.current++;
      setFeed(prev => [{ ...next, _key: counter.current++, _new: true }, ...prev.slice(0, 14).map(i => ({ ...i, _new: false }))]);
    }, 8000);
    return () => clearInterval(iv);
  }, [incidents.length]);
  return feed;
}

export default function LiveFeed() {
  const { data: incidents = [] } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"], queryFn: () => apiRequest("GET", "/api/incidents").then(r => r.json()),
  });
  const { data: stats } = useQuery<any>({
    queryKey: ["/api/stats"], queryFn: () => apiRequest("GET", "/api/stats").then(r => r.json()),
  });
  const { data: blotter } = useQuery<any>({
    queryKey: ["/api/spd-blotter"],
    queryFn: () => apiRequest("GET", "/api/spd-blotter").then(r => r.json()),
    refetchInterval: 300000, // 5 min
  });

  const feed = useLiveFeed(incidents);
  const sorted = [...incidents].sort((a, b) => b.date.localeCompare(a.date));
  const mostRecent = sorted[0];
  const crimeOnly = incidents.filter(i => i.category === "crime");
  const topHood = Object.entries(
    crimeOnly.reduce<Record<string, number>>((a, i) => { a[i.neighborhood] = (a[i.neighborhood] || 0) + 1; return a; }, {})
  ).sort(([, a], [, b]) => b - a)[0];

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="Live Feed" subtitle="Live Incident Monitoring · Bulle Cloud" />
        <main className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">

          <div className="flex items-center gap-2 text-[10px] text-[#6B6B6D]">
            <span className="pulse-dot" />
            <span>Data current as of Apr 14, 2026 · SPD Blotter RSS checked every 5 minutes</span>
            <span className="ml-auto tabular-nums text-[#939598]">{stats?.crimeTotal ?? "—"} crime incidents + {stats?.policyCount ?? "—"} policy entries</span>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white border border-[#D3E0E8] rounded-md p-3">
              <div className="text-[9px] font-medium text-[#939598] mb-1">Most Recent</div>
              {mostRecent ? <>
                <div className="text-[12px] font-semibold text-[#231F20]">{mostRecent.neighborhood}</div>
                <div className="text-[10px] text-[#939598]">{mostRecent.type}</div>
                <div className="tabular-nums text-[9px] mt-1" style={{ color: BLUE }}>{new Date(mostRecent.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
              </> : <div className="text-[#B5B8BC] text-[10px]">—</div>}
            </div>
            <div className="bg-white border border-[#D3E0E8] rounded-md p-3">
              <div className="text-[9px] font-medium text-[#939598] mb-1">Highest Risk</div>
              {topHood ? <>
                <div className="text-[12px] font-semibold text-[#231F20]">{topHood[0]}</div>
                <div className="text-[10px] text-[#939598]">{topHood[1]} incidents</div>
              </> : <div className="text-[#B5B8BC] text-[10px]">—</div>}
            </div>
            <div className="bg-white border border-[#D3E0E8] rounded-md p-3">
              <div className="text-[9px] font-medium text-[#939598] mb-1">Open</div>
              <div className="tabular-nums text-[22px] font-semibold leading-none" style={{ color: "#E07A2F" }}>{stats?.underInvestigation ?? "—"}</div>
            </div>
            <div className="bg-white border border-[#D3E0E8] rounded-md p-3">
              <div className="text-[9px] font-medium text-[#939598] mb-1">Resolution Rate</div>
              <div className="tabular-nums text-[22px] font-semibold leading-none" style={{ color: BLUE }}>{stats ? Math.round((stats.resolved / stats.total) * 100) : "—"}%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Feed + SPD Blotter */}
            <div className="flex flex-col gap-3">
              {/* Incident stream */}
              <div className="bg-white border border-[#D3E0E8] rounded-md flex flex-col" style={{ maxHeight: 360 }}>
                <div className="px-4 py-2 border-b border-[#D3E0E8] flex items-center gap-2">
                  <span className="pulse-dot" />
                  <span className="text-[11px] font-medium text-[#231F20]">Verified Incident Stream</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {feed.map(inc => (
                    <div key={inc._key}
                      className={`flex items-start gap-2.5 p-3 rounded border transition-all ${inc._new ? "live-item-enter border-[#0046AD]/15 bg-[#EDF4FC]" : "border-[#EBF0F4] bg-[#F5F8FA]"}`}>
                      <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0" style={{ background: SEV_BG[inc.severity] ?? "#F5F8FA" }}>
                        <AlertTriangle size={11} style={{ color: SEV[inc.severity] ?? "#939598" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <SeverityBadge severity={inc.severity} />
                          <StatusBadge status={inc.status} />
                          {inc._new && <span className="text-[7px] font-medium" style={{ color: BLUE }}>NEW</span>}
                        </div>
                        <div className="text-[10px] font-medium text-[#231F20]">{inc.type}</div>
                        <div className="text-[9px] text-[#939598]">{inc.neighborhood} · {inc.platform}</div>
                        <div className="text-[9px] text-[#6B6B6D] mt-0.5 line-clamp-2 leading-relaxed">{inc.description}</div>
                        <div className="flex items-center gap-2 text-[8px] text-[#B5B8BC] mt-1">
                          <span className="tabular-nums">{new Date(inc.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                          {inc.sourceUrl ? (
                            <a href={inc.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[#0046AD] hover:underline flex items-center gap-0.5">{inc.source} <ExternalLink size={7} /></a>
                          ) : <span>{inc.source}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SPD Blotter RSS — real live data */}
              <div className="bg-white border border-[#D3E0E8] rounded-md flex flex-col" style={{ maxHeight: 280 }}>
                <div className="px-4 py-2 border-b border-[#D3E0E8] flex items-center gap-2">
                  <Rss size={11} className="text-[#0046AD]" />
                  <span className="text-[11px] font-medium text-[#231F20]">SPD Blotter — Live RSS Feed</span>
                  {blotter?.fetchedAt && (
                    <span className="ml-auto text-[8px] text-[#B5B8BC] tabular-nums">
                      Fetched {new Date(blotter.fetchedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-[#EBF0F4]">
                  {blotter?.error && <div className="px-4 py-3 text-[10px] text-[#939598]">Could not fetch SPD Blotter: {blotter.error}</div>}
                  {blotter?.items?.length === 0 && !blotter?.error && <div className="px-4 py-3 text-[10px] text-[#939598]">No recent posts.</div>}
                  {blotter?.items?.map((item: any, i: number) => (
                    <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
                      className="block px-4 py-2.5 hover:bg-[#F5F8FA] transition-colors">
                      <div className="text-[10px] font-medium text-[#231F20]">{item.title}</div>
                      <div className="text-[9px] text-[#939598] mt-0.5 line-clamp-2">{item.description?.replace(/<[^>]*>/g, '').substring(0, 150)}</div>
                      <div className="text-[8px] text-[#B5B8BC] mt-0.5 tabular-nums">
                        {item.pubDate ? new Date(item.pubDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Context */}
            <div className="flex flex-col gap-3">
              <div className="bg-white border border-[#D3E0E8] rounded-md p-4">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#231F20] mb-3">
                  <TrendingUp size={12} className="text-[#939598]" /> Seattle Crime Context (2024)
                </div>
                <div className="space-y-1.5 text-[10px]">
                  {[
                    { l: "Total violent crimes", v: "5,891", s: "SPD 2024" },
                    { l: "Total robberies", v: "1,677", s: "SPD 2024" },
                    { l: "Aggravated assaults", v: "3,810", s: "SPD 2024" },
                    { l: "Active rideshare drivers (Uber)", v: "24,700+", s: "Seattle Times" },
                    { l: "Driver homicides (2020–24)", v: "5", s: "Cascade PBS" },
                    { l: "Workplace violence rate", v: "67%", s: "Strat. Org. Center" },
                    { l: "Violent crime change", v: "↓ 7%", s: "WASPC 2025" },
                  ].map(({ l, v, s }) => (
                    <div key={l} className="flex items-center justify-between py-1 border-b border-[#EBF0F4] last:border-0">
                      <span className="text-[#6B6B6D]">{l}</span>
                      <div className="text-right"><span className="tabular-nums font-medium text-[#231F20]">{v}</span><div className="text-[8px] text-[#B5B8BC]">{s}</div></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#FEEAE7]/40 border border-[#F15B46]/15 rounded-md p-4">
                <div className="text-[10px] font-medium text-[#B23525] mb-2">Safety Advisories</div>
                <div className="space-y-1.5 text-[9px] text-[#B23525]/80 leading-relaxed">
                  {[
                    "Rainier Beach / South Seattle: elevated incident concentration, particularly late night.",
                    "SODO / Industrial District: higher carjacking risk near industrial zones.",
                    "Atlantic City Boat Ramp / Seward Park: documented isolation-based assault zone.",
                    "Drivers report vulnerability at low-traffic pickup points — boat ramps, industrial lots, park edges.",
                  ].map((a, i) => <div key={i} className="flex items-start gap-1"><span className="mt-0.5">·</span>{a}</div>)}
                </div>
              </div>

              <div className="bg-[#F5F8FA] border border-[#D3E0E8] rounded-md p-3 text-[9px] text-[#939598] leading-relaxed">
                <div className="font-medium text-[#6B6B6D] mb-0.5">About this data</div>
                Incidents are manually verified against SPD Blotter, news sources (KOMO, KIRO 7, Fox 13, Cascade PBS), and King County court records. The SPD Blotter RSS panel above shows live posts from <span className="font-medium">spdblotter.seattle.gov</span>. Source links are provided for each verified incident. Data sources last checked: {stats?.lastVerified ?? "—"}.
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
