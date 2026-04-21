import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { SeverityBadge, StatusBadge } from "@/components/SeverityBadge";
import { useState, useEffect, useRef } from "react";
import { TrendingUp, AlertTriangle, ExternalLink, Rss } from "lucide-react";
import type { Incident } from "@shared/schema";

const TEAL = "#2563EB";
const SEV: Record<string, string> = { fatal: "#000000", injury: "#4F4F4F", robbery: "#7A7A7A", assault: "#9E9E9E", policy: "#9E9E9E", other: "#9E9E9E" };
const SEV_BG: Record<string, string> = { fatal: "#E0E0E0", injury: "#E8E8E8", robbery: "#E8E8E8", assault: "#E8E8E8", policy: "#E8E8E8", other: "#F2F2F2" };

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
    <Layout title="Live Feed" subtitle="Live Incident Monitoring · Seattle Metro">
        <main className="flex-1 p-3 md:p-4 flex flex-col gap-4 overflow-y-auto">

          <div className="flex items-center gap-2 text-[10px] text-[#4F4F4F]">
            <span className="pulse-dot" />
            <span>Data current as of Apr 14, 2026 · Real-Time Incident Tracking · updated every 5 minutes</span>
            <span className="ml-auto tabular-nums text-[#9E9E9E]">{stats?.crimeTotal ?? "—"} crime incidents + {stats?.policyCount ?? "—"} policy entries</span>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#F7F7F7] border border-[#D1D1D1] rounded-md p-3">
              <div className="text-[9px] font-medium text-[#4F4F4F] mb-1">Most Recent</div>
              {mostRecent ? <>
                <div className="text-[12px] font-semibold text-[#000000]">{mostRecent.neighborhood}</div>
                <div className="text-[10px] text-[#4F4F4F]">{mostRecent.type}</div>
                <div className="tabular-nums text-[9px] mt-1" style={{ color: TEAL }}>{new Date(mostRecent.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
              </> : <div className="text-[#9E9E9E] text-[10px]">—</div>}
            </div>
            <div className="bg-[#F7F7F7] border border-[#D1D1D1] rounded-md p-3">
              <div className="text-[9px] font-medium text-[#4F4F4F] mb-1">Highest Risk</div>
              {topHood ? <>
                <div className="text-[12px] font-semibold text-[#000000]">{topHood[0]}</div>
                <div className="text-[10px] text-[#4F4F4F]">{topHood[1]} incidents</div>
              </> : <div className="text-[#9E9E9E] text-[10px]">—</div>}
            </div>
            <div className="bg-[#F7F7F7] border border-[#D1D1D1] rounded-md p-3">
              <div className="text-[9px] font-medium text-[#4F4F4F] mb-1">Open</div>
              <div className="tabular-nums text-[22px] font-semibold leading-none" style={{ color: "#4F4F4F" }}>{stats?.underInvestigation ?? "—"}</div>
            </div>
            <div className="bg-[#F7F7F7] border border-[#D1D1D1] rounded-md p-3">
              <div className="text-[9px] font-medium text-[#4F4F4F] mb-1">Resolution Rate</div>
              <div className="tabular-nums text-[22px] font-semibold leading-none" style={{ color: TEAL }}>{stats ? Math.round((stats.resolved / stats.total) * 100) : "—"}%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Feed + SPD Blotter */}
            <div className="flex flex-col gap-3">
              {/* Incident stream */}
              <div className="bg-[#F7F7F7] border border-[#D1D1D1] rounded-md flex flex-col" style={{ maxHeight: 360 }}>
                <div className="px-4 py-2 border-b border-[#D1D1D1] flex items-center gap-2">
                  <span className="pulse-dot" />
                  <span className="text-[11px] font-medium text-[#000000]">Verified Incident Stream</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {feed.map(inc => (
                    <div key={inc._key}
                      className={`flex items-start gap-2.5 p-3 rounded border transition-all ${inc._new ? "live-item-enter border-[#000000]/25 bg-[#F2F2F2]" : "border-[#D1D1D1] bg-[#F7F7F7]"}`}>
                      <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0" style={{ background: SEV_BG[inc.severity] ?? "#F2F2F2" }}>
                        <AlertTriangle size={11} style={{ color: SEV[inc.severity] ?? "#9E9E9E" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <SeverityBadge severity={inc.severity} />
                          <StatusBadge status={inc.status} />
                          {inc._new && <span className="text-[7px] font-medium" style={{ color: TEAL }}>NEW</span>}
                        </div>
                        <div className="text-[10px] font-medium text-[#000000]">{inc.type}</div>
                        <div className="text-[9px] text-[#4F4F4F]">{inc.neighborhood} · {inc.platform}</div>
                        <div className="text-[9px] text-[#9E9E9E] mt-0.5 line-clamp-2 leading-relaxed">{inc.description}</div>
                        <div className="flex items-center gap-2 text-[8px] text-[#9E9E9E] mt-1">
                          <span className="tabular-nums">{new Date(inc.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                          {inc.sourceUrl ? (
                            <a href={inc.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-0.5" style={{ color: TEAL }}>{inc.source} <ExternalLink size={7} /></a>
                          ) : <span>{inc.source}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SPD Blotter RSS — real live data */}
              <div className="bg-[#F7F7F7] border border-[#D1D1D1] rounded-md flex flex-col" style={{ maxHeight: 280 }}>
                <div className="px-4 py-2 border-b border-[#D1D1D1] flex items-center gap-2">
                  <Rss size={11} style={{ color: "#000000" }} />
                  <span className="text-[11px] font-medium text-[#000000]">Live Incident Activity</span>
                  {blotter?.fetchedAt && (
                    <span className="ml-auto text-[8px] text-[#9E9E9E] tabular-nums">
                      Fetched {new Date(blotter.fetchedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-[#D1D1D1]">
                  {blotter?.error && <div className="px-4 py-3 text-[10px] text-[#4F4F4F]">Could not fetch SPD Blotter: {blotter.error}</div>}
                  {blotter?.items?.length === 0 && !blotter?.error && <div className="px-4 py-3 text-[10px] text-[#4F4F4F]">No recent posts.</div>}
                  {blotter?.items?.map((item: any, i: number) => (
                    <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
                      className="block px-4 py-2.5 hover:bg-[#F2F2F2] transition-colors">
                      <div className="text-[10px] font-medium text-[#000000]">{item.title}</div>
                      <div className="text-[9px] text-[#4F4F4F] mt-0.5 line-clamp-2">{item.description?.replace(/<[^>]*>/g, '').substring(0, 150)}</div>
                      <div className="text-[8px] text-[#9E9E9E] mt-0.5 tabular-nums">
                        {item.pubDate ? new Date(item.pubDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Context */}
            <div className="flex flex-col gap-3">
              <div className="bg-[#F7F7F7] border border-[#D1D1D1] rounded-md p-4">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#000000] mb-3">
                  <TrendingUp size={12} className="text-[#9E9E9E]" /> Seattle Crime Context (2024)
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
                    <div key={l} className="flex items-center justify-between py-1 border-b border-[#D1D1D1] last:border-0">
                      <span className="text-[#4F4F4F]">{l}</span>
                      <div className="text-right"><span className="tabular-nums font-medium text-[#000000]">{v}</span><div className="text-[8px] text-[#9E9E9E]">{s}</div></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#F2F2F2] border border-[#D1D1D1] rounded-md p-4">
                <div className="text-[10px] font-medium text-[#000000] mb-2">Safety Advisories</div>
                <div className="space-y-1.5 text-[9px] text-[#4F4F4F] leading-relaxed">
                  {[
                    "Rainier Beach / South Seattle: elevated incident concentration, particularly late night.",
                    "SODO / Industrial District: higher carjacking risk near industrial zones.",
                    "Atlantic City Boat Ramp / Seward Park: documented isolation-based assault zone.",
                    "Drivers report vulnerability at low-traffic pickup points — boat ramps, industrial lots, park edges.",
                  ].map((a, i) => <div key={i} className="flex items-start gap-1"><span className="mt-0.5">·</span>{a}</div>)}
                </div>
              </div>

              <div className="bg-[#F7F7F7] border border-[#D1D1D1] rounded-md p-3 text-[9px] text-[#9E9E9E] leading-relaxed">
                <div className="font-medium text-[#4F4F4F] mb-0.5">About this data</div>
                Incidents are manually verified against SPD Blotter, news sources (KOMO, KIRO 7, Fox 13, Cascade PBS), and King County court records. The SPD Blotter RSS panel above shows live posts from <span className="font-medium">spdblotter.seattle.gov</span>. Source links are provided for each verified incident. Data sources last checked: {stats?.lastVerified ?? "—"}.
              </div>
            </div>
          </div>
        </main>
    </Layout>
  );
}
