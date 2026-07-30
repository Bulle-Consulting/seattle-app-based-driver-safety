import Layout from "@/components/Layout";
import { Code2 } from "lucide-react";

const ACCENT = "#FFFFFF";

interface Endpoint {
  method: "GET" | "POST";
  path: string;
  description: string;
  body?: string;
  example: string;
}

const METHOD_STYLES = {
  GET:  { bg: "#1F1F1F", color: "#D9D9D9", border: "#666666" },
  POST: { bg: "#1F1F1F", color: "#C0C0C0", border: "#666666" },
};

const ENDPOINTS: Endpoint[] = [
  {
    method: "GET",
    path: "/api/incidents",
    description: "Returns all verified incidents in the database, ordered by date descending.",
    example: `[
  {
    "id": 42,
    "date": "2025-11-03",
    "type": "Armed Robbery",
    "severity": "robbery",
    "neighborhood": "Rainier Beach",
    "address": "MLK Jr Way S & S Henderson St",
    "platform": "Uber",
    "lat": 47.5225,
    "lng": -122.2793,
    "description": "Driver robbed at gunpoint by passenger...",
    "source": "KOMO News",
    "sourceUrl": "https://komonews.com/...",
    "status": "under-investigation",
    "category": "crime"
  }
]`,
  },
  {
    method: "GET",
    path: "/api/incidents/:id",
    description: "Returns a single incident by numeric ID. Returns 404 if not found.",
    example: `{
  "id": 42,
  "date": "2025-11-03",
  "type": "Armed Robbery",
  "severity": "robbery",
  "neighborhood": "Rainier Beach",
  "platform": "Uber",
  "status": "under-investigation"
}`,
  },
  {
    method: "GET",
    path: "/api/stats",
    description: "Aggregated statistics including KPIs, severity breakdowns, time-of-day distribution, quarterly trends, platform totals, and repeat locations.",
    example: `{
  "total": 147,
  "crimeTotal": 138,
  "fatal": 12,
  "injury": 34,
  "robbery": 56,
  "assault": 36,
  "underInvestigation": 42,
  "policyCount": 6,
  "legalCount": 3,
  "byHour": { "0": 2, "1": 1, ..., "23": 3 },
  "byQuarter": {
    "2024 Q1": 8,
    "2024 Q2": 14,
    "2024 Q3": 19,
    "2024 Q4": 22,
    "2025 Q1": 28
  },
  "byPlatform": {
    "Uber": 68,
    "Lyft": 31,
    "DoorDash": 24,
    "Amazon Flex": 15
  },
  "byNeighborhood": { "Rainier Beach": 22, "SODO": 18, ... },
  "byMonth": { "2024-01": 4, "2024-02": 3, ... },
  "repeatLocations": [
    ["Rainier Beach", 22],
    ["SODO", 18]
  ],
  "lastVerified": "2026-04-17"
}`,
  },
  {
    method: "POST",
    path: "/api/submissions",
    description: "Submit an incident for manual review. Submissions are not published until verified by the team.",
    body: `{
  "date": "2025-11-10",
  "type": "Robbery",
  "neighborhood": "Capitol Hill",
  "address": "Broadway & E Pine St",
  "platform": "Lyft",
  "description": "Description of incident...",
  "contactEmail": "optional@email.com",
  "contactPhone": "206-555-0100"
}`,
    example: `{ "success": true, "message": "Submission received" }`,
  },
  {
    method: "POST",
    path: "/api/alerts",
    description: "Subscribe to email or SMS alerts for new verified incidents in selected neighborhoods.",
    body: `{
  "email": "driver@example.com",
  "phone": "206-555-0100",
  "neighborhoods": "[\"Rainier Beach\",\"SODO\",\"Belltown\"]"
}`,
    example: `{ "success": true, "id": 7 }`,
  },
  {
    method: "GET",
    path: "/api/spd-blotter",
    description: "Proxied RSS feed from the Seattle Police Department Blotter. Returns recent SPD incident reports as JSON.",
    example: `[
  {
    "title": "Robbery - 6700 block of MLK Jr Way S",
    "link": "https://www.seattle.gov/police/news-and-research/police-blotter/...",
    "pubDate": "Mon, 03 Nov 2025 14:22:00 GMT",
    "description": "At 2:10 AM, officers responded to..."
  }
]`,
  },
];

function EndpointCard({ ep }: { ep: Endpoint }) {
  const mStyle = METHOD_STYLES[ep.method];
  return (
    <div
      data-testid={`api-endpoint-${ep.method.toLowerCase()}-${ep.path.replace(/\//g, "-").replace(/:/g, "")}`}
      className="bg-[#121212] border border-[#4D4D4D] rounded-md overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#4D4D4D] bg-[#121212]">
        <span
          className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider font-mono shrink-0"
          style={{ background: mStyle.bg, color: mStyle.color, border: `1px solid ${mStyle.border}` }}
        >
          {ep.method}
        </span>
        <code className="text-[12px] font-mono text-[#FFFFFF] font-medium">{ep.path}</code>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-[11px] text-[#D9D9D9] leading-relaxed">{ep.description}</p>

        {ep.body && (
          <div>
            <div className="section-label mb-1.5">Request Body</div>
            <pre className="text-[10px] sm:text-[11px] font-mono bg-[#1A1A1A] border border-[#4D4D4D] rounded p-3 overflow-x-auto text-[#D9D9D9] leading-relaxed">
              <code>{ep.body}</code>
            </pre>
          </div>
        )}

        <div>
          <div className="section-label mb-1.5">Example Response</div>
          <pre className="text-[10px] sm:text-[11px] font-mono bg-[#1A1A1A] border border-[#4D4D4D] rounded p-3 overflow-x-auto leading-relaxed"
            style={{ color: ACCENT }}>
            <code>{ep.example}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

export default function ApiDocsPage() {
  return (
    <Layout title="API Documentation" subtitle="Public API for researchers and developers">
        <main className="flex-1 p-3 md:p-5 space-y-5">

          {/* Intro */}
          <div className="bg-[#121212] border border-[#4D4D4D] rounded-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <Code2 size={14} style={{ color: ACCENT }} />
              <div className="text-[11px] font-semibold text-[#FFFFFF]">Overview</div>
            </div>
            <p className="text-[11px] text-[#D9D9D9] leading-relaxed mb-2">
              This API provides public access to Seattle rideshare safety incident data. All endpoints return JSON. No authentication is required for read operations.
            </p>
            <div className="flex items-center gap-3 text-[10px] text-[#A6A6A6]">
              <span>Base URL: <code className="font-mono text-[#FFFFFF] bg-[#1A1A1A] px-1.5 py-0.5 rounded">https://safetysteward.bullecloud.com</code></span>
            </div>
            <div
              className="mt-2 rounded border px-2.5 py-2 text-[10px] leading-relaxed"
              style={{
                background: "hsl(var(--bg-raised))",
                borderColor: "hsl(var(--border-lite))",
                color: "hsl(var(--text-secondary))",
              }}
            >
              <span className="font-semibold">Not yet live.</span> The base URL above does not
              currently resolve and no backend is hosted, so these endpoints are unavailable
              over the public internet. They work when the Express server is run locally
              (<code className="font-mono">npm run dev</code>). Read-only incident and stats data
              is published as a static <code className="font-mono">incidents.json</code> at the
              site root. See <code className="font-mono">DEPLOYMENT.md</code> for what has to be
              provisioned.
            </div>
            <div className="mt-3 p-3 rounded border border-[#4D4D4D] bg-[#1A1A1A]">
              <div className="text-[9px] text-[#A6A6A6] leading-relaxed">
                <span className="font-medium" style={{ color: ACCENT }}>Research Citation:</span>{" "}
                This API is free for research and advocacy use. Please cite{" "}
                <em className="text-[#FFFFFF]">"App-Based Driver Safety Steward by Bulle Cloud"</em>{" "}
                in publications.
              </div>
            </div>
          </div>

          {/* Method legend */}
          <div className="flex items-center gap-4 text-[10px]">
            <span className="text-[#A6A6A6] font-medium">Method:</span>
            {(["GET", "POST"] as const).map(m => {
              const s = METHOD_STYLES[m];
              return (
                <span key={m} className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono"
                    style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                    {m}
                  </span>
                  <span className="text-[#A6A6A6]">{m === "GET" ? "Read" : "Write"}</span>
                </span>
              );
            })}
          </div>

          {/* Endpoints */}
          <div className="space-y-4">
            {ENDPOINTS.map((ep, i) => <EndpointCard key={i} ep={ep} />)}
          </div>

          <div className="text-[9px] text-[#A6A6A6] pb-2">
            bullecloud.com · API subject to change. Subscribe to updates at laborstandards@seattle.gov.
          </div>
        </main>
    </Layout>
  );
}
