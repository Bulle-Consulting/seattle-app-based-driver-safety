import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, LineChart, Line, CartesianGrid, Cell,
} from "recharts";
import { AlertTriangle, Video, FileText } from "lucide-react";
import type { Incident } from "@shared/schema";

const TEAL = "#26A69A";
const TEAL_DIM = "#1B7D74";
const PLT_COLORS: Record<string, string> = {
  Uber: "#8B95A8",
  Lyft: "#E91E8C",
  DoorDash: "#F87171",
  "Amazon Flex": "#E8A317",
};

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="font-medium text-[#F5F5F5] mb-0.5">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-[10px]" style={{ color: p.color || p.fill || TEAL }}>
          {p.name}: <span className="font-medium">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

function SectionCard({ title, subtitle, children }: {
  title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-[#151d2e] border border-[#1F2937] rounded-md p-4">
      <div className="mb-3">
        <div className="text-[11px] font-semibold text-[#F5F5F5]">{title}</div>
        {subtitle && <div className="text-[9px] text-[#8B95A8] mt-0.5">{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

// ── A) Time-of-Day Heatmap ──────────────────────────────────────────────────
function TimeHeatmap({ byHour }: { byHour: Record<string, number> }) {
  const data = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    label: h === 0 ? "12am" : h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`,
    count: byHour[String(h)] ?? 0,
  }));
  const max = Math.max(...data.map(d => d.count), 1);

  return (
    <SectionCard title="Incident Time Distribution" subtitle="When incidents occur (24-hour clock)">
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 4 }}>
          <XAxis dataKey="label" tick={{ fontSize: 8, fill: "#8B95A8" }} axisLine={false} tickLine={false}
            interval={1} angle={-45} textAnchor="end" height={36} />
          <YAxis tick={{ fontSize: 8, fill: "#8B95A8" }} axisLine={false} tickLine={false} width={22} />
          <Tooltip content={<Tip />} />
          <Bar dataKey="count" name="Incidents" radius={[2, 2, 0, 0]}>
            {data.map((entry, i) => {
              const intensity = max > 0 ? entry.count / max : 0;
              const r = Math.round(26 + intensity * (38 - 26));
              const g = Math.round(166 + intensity * (200 - 166));
              const b = Math.round(154 + intensity * (100 - 154));
              const color = entry.count === 0 ? "#1F2937" : `rgb(${r},${g},${b})`;
              return <Cell key={i} fill={color} opacity={entry.count === 0 ? 0.3 : 0.85} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-[9px] text-[#8B95A8] mt-2 leading-relaxed">
        Based on incidents with recorded times. Not all incidents have time data.
      </p>
    </SectionCard>
  );
}

// ── B) Quarterly Trend ──────────────────────────────────────────────────────
function QuarterlyTrend({ byQuarter }: { byQuarter: Record<string, number> }) {
  const sorted = Object.entries(byQuarter).sort(([a], [b]) => a.localeCompare(b));
  const n = sorted.length;

  // linear regression
  const xs = sorted.map((_, i) => i);
  const ys = sorted.map(([, v]) => v);
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  const slope = n > 1
    ? xs.reduce((acc, x, i) => acc + (x - meanX) * (ys[i] - meanY), 0) /
      xs.reduce((acc, x) => acc + (x - meanX) ** 2, 0)
    : 0;
  const intercept = meanY - slope * meanX;

  // add one forecast quarter
  const lastQuarter = sorted[n - 1]?.[0] ?? "2024 Q4";
  const [yr, q] = lastQuarter.split(" Q");
  const nextQ = Number(q) === 4 ? `${Number(yr) + 1} Q1` : `${yr} Q${Number(q) + 1}`;
  const forecastValue = Math.max(0, Math.round(intercept + slope * n));

  const data = [
    ...sorted.map(([label, value], i) => ({
      label, value,
      trend: Math.max(0, Math.round(intercept + slope * i)),
      forecast: null as number | null,
    })),
    { label: nextQ, value: null as number | null, trend: forecastValue, forecast: forecastValue },
  ];

  return (
    <SectionCard title="Quarterly Trend & Forecast" subtitle="Incidents per quarter with linear projection">
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 4 }}>
          <XAxis dataKey="label" tick={{ fontSize: 8, fill: "#8B95A8" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 8, fill: "#8B95A8" }} axisLine={false} tickLine={false} width={22} />
          <CartesianGrid strokeDasharray="2 3" stroke="#1F2937" vertical={false} />
          <Tooltip content={<Tip />} />
          <Bar dataKey="value" name="Incidents" fill={TEAL} opacity={0.8} radius={[2, 2, 0, 0]} />
          <Bar dataKey="forecast" name="Forecast" fill={TEAL_DIM} opacity={0.5} radius={[2, 2, 0, 0]}
            strokeDasharray="4 2" stroke={TEAL} strokeWidth={1} />
          <ReferenceLine
            x={nextQ}
            stroke="#8B95A8"
            strokeDasharray="4 2"
            label={{ value: "Forecast", fontSize: 8, fill: "#8B95A8", position: "top" }}
          />
        </BarChart>
      </ResponsiveContainer>
    </SectionCard>
  );
}

// ── C) Platform Comparison ──────────────────────────────────────────────────
function PlatformComparison({ byPlatform }: { byPlatform: Record<string, number> }) {
  const data = Object.entries(byPlatform)
    .map(([name, value]) => ({ name, value, fill: PLT_COLORS[name] ?? "#6D7A8F" }))
    .sort((a, b) => b.value - a.value);

  return (
    <SectionCard title="Platform Comparison" subtitle="Incident count per platform">
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} layout="vertical" margin={{ top: 2, right: 16, left: 0, bottom: 2 }}>
          <XAxis type="number" tick={{ fontSize: 8, fill: "#8B95A8" }} axisLine={false} tickLine={false} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: "#8B95A8" }} axisLine={false} tickLine={false} width={72} />
          <Tooltip content={<Tip />} />
          <Bar dataKey="value" name="Incidents" radius={[0, 3, 3, 0]}>
            {data.map((e, i) => <Cell key={i} fill={e.fill} opacity={0.8} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-[9px] text-[#8B95A8] mt-2 leading-relaxed">
        Counts are not normalized by active driver population.
      </p>
    </SectionCard>
  );
}

// ── D) Repeat Location Alerts ───────────────────────────────────────────────
function RepeatLocations({ repeatLocations }: { repeatLocations: [string, number][] }) {
  const sorted = [...repeatLocations].sort(([, a], [, b]) => b - a);
  const max = sorted[0]?.[1] ?? 1;

  return (
    <SectionCard title="Repeat Incident Locations" subtitle="Neighborhoods with 2+ incidents">
      {sorted.length === 0 ? (
        <p className="text-[10px] text-[#8B95A8]">No repeat locations recorded.</p>
      ) : (
        <div className="space-y-2">
          {sorted.map(([neighborhood, count]) => {
            const isHigh = count >= max * 0.6;
            return (
              <div
                key={neighborhood}
                data-testid={`repeat-loc-${neighborhood}`}
                className="flex items-center gap-2.5 px-3 py-2 rounded-md border"
                style={{
                  background: isHigh ? "rgba(232,163,23,0.08)" : "rgba(31,41,55,0.4)",
                  borderColor: isHigh ? "rgba(232,163,23,0.2)" : "#1F2937",
                }}
              >
                <AlertTriangle size={12} style={{ color: isHigh ? "#E8A317" : "#8B95A8" }} />
                <span className="flex-1 text-[11px] text-[#F5F5F5] font-medium">{neighborhood}</span>
                <span
                  className="tabular-nums text-[13px] font-semibold"
                  style={{ color: isHigh ? "#E8A317" : "#A3AEC0" }}
                >
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

// ── E) Case Tracker ─────────────────────────────────────────────────────────
const CASE_STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending:    { bg: "rgba(251,191,36,0.1)",   color: "#FBBF24" },
  arraigned:  { bg: "rgba(96,165,250,0.1)",   color: "#60A5FA" },
  arrested:   { bg: "rgba(251,146,60,0.1)",   color: "#FB923C" },
  convicted:  { bg: "rgba(38,166,154,0.12)",  color: "#26A69A" },
  sentenced:  { bg: "rgba(52,211,153,0.1)",   color: "#34D399" },
  resolved:   { bg: "rgba(52,211,153,0.1)",   color: "#34D399" },
};

function CaseTracker({ incidents }: { incidents: Incident[] }) {
  const caseIncidents = incidents.filter(
    i => (i as any).caseStatus || (i as any).suspectName
  ).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <SectionCard title="Court Case Tracker" subtitle="Incidents with active or resolved cases">
      {caseIncidents.length === 0 ? (
        <p className="text-[10px] text-[#8B95A8]">No case data available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-[#0b1120] border-b border-[#1F2937]">
                {["Date", "Type", "Suspect", "Case #", "Status", "Sentence"].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-[9px] font-medium text-[#8B95A8] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]">
              {caseIncidents.map(inc => {
                const caseStatus = (inc as any).caseStatus ?? "";
                const statusStyle = CASE_STATUS_COLORS[caseStatus?.toLowerCase()] ?? { bg: "transparent", color: "#8B95A8" };
                return (
                  <tr key={inc.id} data-testid={`case-row-${inc.id}`} className="hover:bg-[#0b1120] transition-colors">
                    <td className="px-3 py-2.5 tabular-nums text-[#A3AEC0] whitespace-nowrap">
                      {new Date(inc.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-3 py-2.5 text-[#F5F5F5] font-medium max-w-[140px] truncate">{inc.type}</td>
                    <td className="px-3 py-2.5 text-[#A3AEC0]">{(inc as any).suspectName ?? "—"}</td>
                    <td className="px-3 py-2.5 text-[#A3AEC0] tabular-nums">{(inc as any).caseNumber ?? "—"}</td>
                    <td className="px-3 py-2.5">
                      {caseStatus ? (
                        <span className="px-2 py-0.5 rounded text-[9px] font-medium capitalize"
                          style={{ background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.color}30` }}>
                          {caseStatus}
                        </span>
                      ) : <span className="text-[#8B95A8]">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-[#A3AEC0]">{(inc as any).sentence ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}

// ── F) Evidence Tracker ─────────────────────────────────────────────────────
function EvidenceTracker({ incidents }: { incidents: Incident[] }) {
  const withVideo = incidents.filter(i => (i as any).hasVideo === 1 || (i as any).hasVideo === true).length;
  const total = incidents.length;
  const pct = total > 0 ? Math.round((withVideo / total) * 100) : 0;

  return (
    <SectionCard title="Evidence Tracker" subtitle="Dashcam & video documentation">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(38,166,154,0.1)", border: "2px solid rgba(38,166,154,0.3)" }}>
          <Video size={22} style={{ color: TEAL }} />
        </div>
        <div>
          <div className="text-[22px] font-semibold tabular-nums text-[#F5F5F5]">
            {withVideo} <span className="text-[14px] text-[#8B95A8] font-normal">of {total}</span>
          </div>
          <div className="text-[11px] text-[#A3AEC0]">incidents have video/dashcam evidence</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-[26px] font-semibold tabular-nums" style={{ color: TEAL }}>{pct}%</div>
          <div className="text-[9px] text-[#8B95A8]">coverage rate</div>
        </div>
      </div>
      <div className="h-2 rounded-full bg-[#1F2937] mb-4">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: TEAL, opacity: 0.8 }} />
      </div>
      <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-md border border-[#1F2937] bg-[#0E3D39]/30">
        <FileText size={12} style={{ color: TEAL }} className="mt-0.5 shrink-0" />
        <p className="text-[10px] text-[#A3AEC0] leading-relaxed">
          <span className="font-medium text-[#F5F5F5]">Seattle Rideshare Drivers Association</span> advocates for mandatory dashcams in all app-based vehicles to improve evidence collection and driver safety.
        </p>
      </div>
    </SectionCard>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { data: stats, isLoading: stL } = useQuery<any>({
    queryKey: ["/api/stats"],
    queryFn: () => apiRequest("GET", "/api/stats").then(r => r.json()),
  });
  const { data: incidents = [], isLoading: incL } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
    queryFn: () => apiRequest("GET", "/api/incidents").then(r => r.json()),
  });

  const byHour: Record<string, number> = stats?.byHour ?? {};
  const byQuarter: Record<string, number> = stats?.byQuarter ?? {};
  const byPlatform: Record<string, number> = stats?.byPlatform ?? {};
  const repeatLocations: [string, number][] = stats?.repeatLocations ?? [];

  const loading = stL || incL;

  return (
    <Layout title="Analytics" subtitle="Advanced Crime Analytics · Seattle Metro">
        <main className="flex-1 p-3 md:p-5 space-y-5">

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-[#151d2e] border border-[#1F2937] rounded-md p-4 h-60">
                  <Skeleton className="h-4 w-40 mb-3" />
                  <Skeleton className="h-40 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* 2-column grid for sections A-D */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TimeHeatmap byHour={byHour} />
                <QuarterlyTrend byQuarter={byQuarter} />
                <PlatformComparison byPlatform={byPlatform} />
                <RepeatLocations repeatLocations={repeatLocations} />
              </div>

              {/* Full-width sections E-F */}
              <div className="space-y-4">
                <CaseTracker incidents={incidents} />
                <EvidenceTracker incidents={incidents} />
              </div>
            </>
          )}

          <div className="text-[9px] text-[#8B95A8] pb-2">
            bullecloud.com · Analytics data derived from verified incident database
          </div>
        </main>
    </Layout>
  );
}
