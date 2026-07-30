import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { SeverityBadge, StatusBadge } from "@/components/SeverityBadge";
import { useState, useMemo } from "react";
import { Search, Download } from "lucide-react";
import type { Incident } from "@shared/schema";

const ACCENT = "#FFFFFF";

export default function IncidentsPage() {
  const [search, setSearch]       = useState("");
  const [platform, setPlatform]   = useState("All");
  const [severity, setSeverity]   = useState("All");
  const [status, setStatus]       = useState("All");
  const [sortDir, setSortDir]     = useState<"asc" | "desc">("desc");

  const { data: incidents = [], isLoading } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
    queryFn: () => apiRequest("GET", "/api/incidents").then(r => r.json()),
  });

  const filtered = useMemo(() => {
    return incidents.filter(i => {
      if (platform !== "All" && i.platform !== platform) return false;
      if (severity !== "All" && i.severity !== severity) return false;
      if (status   !== "All" && i.status   !== status)   return false;
      if (search) { const q = search.toLowerCase(); return i.neighborhood.toLowerCase().includes(q) || i.type.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.platform.toLowerCase().includes(q); }
      return true;
    }).sort((a, b) => sortDir === "desc" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));
  }, [incidents, platform, severity, status, search, sortDir]);

  const download = () => {
    const h = ["Date","Type","Severity","Neighborhood","Address","Platform","Victim","Description","Status","Source"];
    const rows = filtered.map(i => [i.date,i.type,i.severity,i.neighborhood,i.address,i.platform,i.victim??"",'\"'+i.description.replace(/"/g,"'")+'\"',i.status,i.source].join(","));
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([[h.join(","),...rows].join("\n")], { type: "text/csv" })), download: "ridewatch.csv" }); a.click();
  };

  return (
    <Layout title="All Incidents" subtitle="Complete Incident Database · Seattle Metro">
        <main className="flex-1 p-3 md:p-4 flex flex-col gap-3 min-h-0">

          <div className="bg-[#121212] border border-[#4D4D4D] rounded-md px-4 py-2.5 flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#A6A6A6]" />
              <input data-testid="input-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                className="w-full pl-7 pr-2 py-1.5 bg-[#121212] border border-[#4D4D4D] rounded text-[10px] text-[#FFFFFF] placeholder:text-[#A6A6A6] focus:outline-none focus:border-[#C0C0C0]/60" />
            </div>
            {[
              { label: "Platform", opts: ["All","Uber","Lyft","DoorDash","Amazon Flex"], val: platform, set: setPlatform },
              { label: "Severity", opts: ["All","fatal","injury","robbery","assault"], val: severity, set: setSeverity },
              { label: "Status",   opts: ["All","resolved","under investigation"], val: status, set: setStatus },
            ].map(({ label, opts, val, set }) => (
              <div key={label} className="flex items-center gap-1">
                <span className="section-label">{label}</span>
                <select value={val} onChange={e => set(e.target.value)}
                  className="text-[10px] bg-[#121212] border border-[#4D4D4D] text-[#FFFFFF] rounded px-1.5 py-1 capitalize focus:outline-none hover:border-[#808080]">
                  {opts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <button onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")} className="text-[10px] text-[#D9D9D9] border border-[#4D4D4D] px-2 py-1 rounded hover:border-[#808080]">Date {sortDir === "desc" ? "↓" : "↑"}</button>
            <button data-testid="button-export" onClick={download} className="flex items-center gap-1 text-[10px] text-[#D9D9D9] border border-[#4D4D4D] px-2 py-1 rounded hover:border-[#808080]"><Download size={10} /> CSV</button>
            <span className="text-[10px] text-[#A6A6A6] tabular-nums ml-auto">{filtered.length}</span>
          </div>

          <div className="flex-1 bg-[#121212] border border-[#4D4D4D] rounded-md overflow-hidden flex flex-col min-h-0">
            <div className="overflow-y-auto overflow-x-auto flex-1">
              <table className="w-full text-[11px] min-w-[600px]">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#1A1A1A] border-b border-[#4D4D4D]">
                    {["Date","Type","Severity","Neighborhood","Platform","Victim","Status","Source"].map(h => (
                      <th key={h} className="px-4 py-2 text-left text-[9px] font-medium text-[#A6A6A6] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#4D4D4D]">
                  {isLoading ? Array(8).fill(0).map((_, i) => <tr key={i}>{Array(8).fill(0).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-[#333333] rounded animate-pulse w-16" /></td>)}</tr>)
                    : !filtered.length ? <tr><td colSpan={8} className="px-4 py-12 text-center text-[#A6A6A6] text-[11px]">No results.</td></tr>
                    : filtered.map(inc => (
                      <tr key={inc.id} data-testid={`row-incident-${inc.id}`} className="hover:bg-white/[0.06] transition-colors">
                        <td className="px-4 py-2.5 tabular-nums text-[#D9D9D9] whitespace-nowrap">{new Date(inc.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                        <td className="px-4 py-2.5 font-medium text-[#FFFFFF] max-w-[130px] truncate">{inc.type}</td>
                        <td className="px-4 py-2.5"><SeverityBadge severity={inc.severity} /></td>
                        <td className="px-4 py-2.5 text-[#D9D9D9]">{inc.neighborhood}</td>
                        <td className="px-4 py-2.5 text-[#D9D9D9]">{inc.platform}</td>
                        <td className="px-4 py-2.5 text-[#D9D9D9] max-w-[100px] truncate">{inc.victim ?? "—"}</td>
                        <td className="px-4 py-2.5"><StatusBadge status={inc.status} /></td>
                        <td className="px-4 py-2.5 text-[#A6A6A6] max-w-[100px] truncate text-[9px]">{inc.source}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </main>
    </Layout>
  );
}
