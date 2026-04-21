import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { SeverityBadge, StatusBadge } from "@/components/SeverityBadge";
import { useState, useMemo } from "react";
import { Search, Download } from "lucide-react";
import type { Incident } from "@shared/schema";

const TEAL = "#2563EB";

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

          <div className="bg-[#F7F7F7] border border-[#D1D1D1] rounded-md px-4 py-2.5 flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9E9E9E]" />
              <input data-testid="input-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                className="w-full pl-7 pr-2 py-1.5 bg-[#F7F7F7] border border-[#D1D1D1] rounded text-[10px] text-[#000000] placeholder:text-[#9E9E9E] focus:outline-none focus:border-[#000000]/60" />
            </div>
            {[
              { label: "Platform", opts: ["All","Uber","Lyft","DoorDash","Amazon Flex"], val: platform, set: setPlatform },
              { label: "Severity", opts: ["All","fatal","injury","robbery","assault"], val: severity, set: setSeverity },
              { label: "Status",   opts: ["All","resolved","under investigation"], val: status, set: setStatus },
            ].map(({ label, opts, val, set }) => (
              <div key={label} className="flex items-center gap-1">
                <span className="section-label">{label}</span>
                <select value={val} onChange={e => set(e.target.value)}
                  className="text-[10px] bg-[#F7F7F7] border border-[#D1D1D1] text-[#000000] rounded px-1.5 py-1 capitalize focus:outline-none hover:border-[#9E9E9E]">
                  {opts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <button onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")} className="text-[10px] text-[#4F4F4F] border border-[#D1D1D1] px-2 py-1 rounded hover:border-[#9E9E9E]">Date {sortDir === "desc" ? "↓" : "↑"}</button>
            <button data-testid="button-export" onClick={download} className="flex items-center gap-1 text-[10px] text-[#4F4F4F] border border-[#D1D1D1] px-2 py-1 rounded hover:border-[#9E9E9E]"><Download size={10} /> CSV</button>
            <span className="text-[10px] text-[#9E9E9E] tabular-nums ml-auto">{filtered.length}</span>
          </div>

          <div className="flex-1 bg-[#F7F7F7] border border-[#D1D1D1] rounded-md overflow-hidden flex flex-col min-h-0">
            <div className="overflow-y-auto overflow-x-auto flex-1">
              <table className="w-full text-[11px] min-w-[600px]">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#F2F2F2] border-b border-[#D1D1D1]">
                    {["Date","Type","Severity","Neighborhood","Platform","Victim","Status","Source"].map(h => (
                      <th key={h} className="px-4 py-2 text-left text-[9px] font-medium text-[#9E9E9E] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D1D1D1]">
                  {isLoading ? Array(8).fill(0).map((_, i) => <tr key={i}>{Array(8).fill(0).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-[#D1D1D1] rounded animate-pulse w-16" /></td>)}</tr>)
                    : !filtered.length ? <tr><td colSpan={8} className="px-4 py-12 text-center text-[#9E9E9E] text-[11px]">No results.</td></tr>
                    : filtered.map(inc => (
                      <tr key={inc.id} data-testid={`row-incident-${inc.id}`} className="hover:bg-[#F2F2F2] transition-colors">
                        <td className="px-4 py-2.5 tabular-nums text-[#4F4F4F] whitespace-nowrap">{new Date(inc.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                        <td className="px-4 py-2.5 font-medium text-[#000000] max-w-[130px] truncate">{inc.type}</td>
                        <td className="px-4 py-2.5"><SeverityBadge severity={inc.severity} /></td>
                        <td className="px-4 py-2.5 text-[#4F4F4F]">{inc.neighborhood}</td>
                        <td className="px-4 py-2.5 text-[#4F4F4F]">{inc.platform}</td>
                        <td className="px-4 py-2.5 text-[#4F4F4F] max-w-[100px] truncate">{inc.victim ?? "—"}</td>
                        <td className="px-4 py-2.5"><StatusBadge status={inc.status} /></td>
                        <td className="px-4 py-2.5 text-[#9E9E9E] max-w-[100px] truncate text-[9px]">{inc.source}</td>
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
