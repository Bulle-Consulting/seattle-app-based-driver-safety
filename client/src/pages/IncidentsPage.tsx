import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { SeverityBadge, StatusBadge } from "@/components/SeverityBadge";
import { useState, useMemo } from "react";
import { Search, Download } from "lucide-react";
import type { Incident } from "@shared/schema";

const BLUE = "#0046AD";

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
    const rows = filtered.map(i => [i.date,i.type,i.severity,i.neighborhood,i.address,i.platform,i.victim??"",'\"'+i.description.replace(/"/g,"'")+'"',i.status,i.source].join(","));
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([[h.join(","),...rows].join("\n")], { type: "text/csv" })), download: "ridewatch.csv" }); a.click();
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="All Incidents" subtitle="Complete Incident Database · Bulle Cloud" />
        <main className="flex-1 p-4 flex flex-col gap-3 min-h-0">

          <div className="bg-white border border-[#E5E7EB] rounded-md px-4 py-2.5 flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#D1D5DB]" />
              <input data-testid="input-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                className="w-full pl-7 pr-2 py-1.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded text-[10px] text-[#3B3F4A] placeholder:text-[#D1D5DB] focus:outline-none focus:border-[#0046AD]/40" />
            </div>
            {[
              { label: "Platform", opts: ["All","Uber","Lyft","DoorDash","Amazon Flex"], val: platform, set: setPlatform },
              { label: "Severity", opts: ["All","fatal","injury","robbery","assault"], val: severity, set: setSeverity },
              { label: "Status",   opts: ["All","resolved","under investigation"], val: status, set: setStatus },
            ].map(({ label, opts, val, set }) => (
              <div key={label} className="flex items-center gap-1">
                <span className="section-label">{label}</span>
                <select value={val} onChange={e => set(e.target.value)}
                  className="text-[10px] bg-white border border-[#E5E7EB] text-[#3B3F4A] rounded px-1.5 py-1 capitalize focus:outline-none hover:border-[#D1D5DB]">
                  {opts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <button onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")} className="text-[10px] text-[#6B7280] border border-[#E5E7EB] px-2 py-1 rounded hover:border-[#D1D5DB]">Date {sortDir === "desc" ? "↓" : "↑"}</button>
            <button data-testid="button-export" onClick={download} className="flex items-center gap-1 text-[10px] text-[#6B7280] border border-[#E5E7EB] px-2 py-1 rounded hover:border-[#D1D5DB]"><Download size={10} /> CSV</button>
            <span className="text-[10px] text-[#D1D5DB] tabular-nums ml-auto">{filtered.length}</span>
          </div>

          <div className="flex-1 bg-white border border-[#E5E7EB] rounded-md overflow-hidden flex flex-col min-h-0">
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-[11px]">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                    {["Date","Type","Severity","Neighborhood","Platform","Victim","Status","Source"].map(h => (
                      <th key={h} className="px-4 py-2 text-left text-[9px] font-medium text-[#9CA3AF] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F5F7]">
                  {isLoading ? Array(8).fill(0).map((_, i) => <tr key={i}>{Array(8).fill(0).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-[#F4F5F7] rounded animate-pulse w-16" /></td>)}</tr>)
                    : !filtered.length ? <tr><td colSpan={8} className="px-4 py-12 text-center text-[#9CA3AF] text-[11px]">No results.</td></tr>
                    : filtered.map(inc => (
                      <tr key={inc.id} data-testid={`row-incident-${inc.id}`} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="px-4 py-2.5 tabular-nums text-[#9CA3AF] whitespace-nowrap">{new Date(inc.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                        <td className="px-4 py-2.5 font-medium text-[#3B3F4A] max-w-[130px] truncate">{inc.type}</td>
                        <td className="px-4 py-2.5"><SeverityBadge severity={inc.severity} /></td>
                        <td className="px-4 py-2.5 text-[#6B7280]">{inc.neighborhood}</td>
                        <td className="px-4 py-2.5 text-[#6B7280]">{inc.platform}</td>
                        <td className="px-4 py-2.5 text-[#6B7280] max-w-[100px] truncate">{inc.victim ?? "—"}</td>
                        <td className="px-4 py-2.5"><StatusBadge status={inc.status} /></td>
                        <td className="px-4 py-2.5 text-[#D1D5DB] max-w-[100px] truncate text-[9px]">{inc.source}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
