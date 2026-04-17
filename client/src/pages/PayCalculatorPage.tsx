import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Calculator, CheckCircle2, Circle, AlertTriangle, Phone, Mail } from "lucide-react";

const TEAL = "#26A69A";

// ── Rate sets ──────────────────────────────────────────────────────────────
const RATE_SETS = {
  seattle: {
    label: "Seattle 2026",
    perMin: 0.47,
    perMile: 0.80,
    perOffer: 5.34,
    cite: "SMC 8.37 (effective Jan 1, 2026)",
  },
  wa: {
    label: "WA Statewide",
    perMin: 0.39,
    perMile: 1.34,
    perTrip: 3.45,
    cite: "RCW 49.46 TNP rates",
  },
};

type RateKey = keyof typeof RATE_SETS;

// ── Pay Calculator ─────────────────────────────────────────────────────────
function PayCalculator() {
  const [platform, setPlatform] = useState("Uber");
  const [hours, setHours] = useState("");
  const [miles, setMiles] = useState("");
  const [trips, setTrips] = useState("");
  const [earnings, setEarnings] = useState("");
  const [rateKey, setRateKey] = useState<RateKey>("seattle");
  const [result, setResult] = useState<{
    minimum: number; actual: number; diff: number; breakdown: string;
  } | null>(null);

  const rates = RATE_SETS[rateKey];

  const calculate = () => {
    const h = parseFloat(hours) || 0;
    const m = parseFloat(miles) || 0;
    const t = parseFloat(trips) || 0;
    const e = parseFloat(earnings) || 0;

    let minimum: number;
    let breakdown: string;

    if (rateKey === "seattle") {
      const timeBased = h * 60 * 0.47;
      const distBased = m * 0.80;
      const offerMin = t * 5.34;
      const calculated = timeBased + distBased;
      minimum = Math.max(calculated, offerMin);
      breakdown = `(${h.toFixed(1)} hrs × 60 × $0.47) + (${m.toFixed(1)} mi × $0.80) = $${calculated.toFixed(2)} — or ${t} offers × $5.34 = $${offerMin.toFixed(2)} (whichever is greater)`;
    } else {
      const timeBased = h * 60 * 0.39;
      const distBased = m * 1.34;
      const tripMin = t * 3.45;
      const calculated = timeBased + distBased;
      minimum = Math.max(calculated, tripMin);
      breakdown = `(${h.toFixed(1)} hrs × 60 × $0.39) + (${m.toFixed(1)} mi × $1.34) = $${calculated.toFixed(2)} — or ${t} trips × $3.45 = $${tripMin.toFixed(2)} (whichever is greater)`;
    }

    setResult({ minimum, actual: e, diff: e - minimum, breakdown });
  };

  const fmt = (n: number) => `$${Math.abs(n).toFixed(2)}`;

  return (
    <div className="bg-[#151d2e] border border-[#1F2937] rounded-md p-5">
      <div className="flex items-center gap-2 mb-4">
        <Calculator size={16} style={{ color: TEAL }} />
        <div>
          <div className="text-[13px] font-semibold text-[#F5F5F5]">Pay Rate Calculator</div>
          <div className="text-[10px] text-[#8B95A8]">Check your earnings against Seattle minimums</div>
        </div>
      </div>

      {/* Rate toggle */}
      <div className="flex gap-1 p-1 rounded-lg bg-[#0b1120] border border-[#1F2937] mb-4 w-fit">
        {(Object.entries(RATE_SETS) as [RateKey, typeof RATE_SETS[RateKey]][]).map(([key, r]) => (
          <button
            key={key}
            data-testid={`rate-toggle-${key}`}
            onClick={() => { setRateKey(key); setResult(null); }}
            className="px-3 py-1.5 rounded-md text-[11px] font-medium transition-all"
            style={rateKey === key
              ? { background: TEAL, color: "white" }
              : { color: "#8B95A8" }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Rate display */}
      <div className="grid grid-cols-3 gap-2 mb-4 p-3 rounded-md bg-[#0E3D39]/30 border border-[#1F2937]">
        <div className="text-center">
          <div className="text-[16px] font-semibold tabular-nums" style={{ color: TEAL }}>
            ${rateKey === "seattle" ? "0.47" : "0.39"}
          </div>
          <div className="text-[9px] text-[#8B95A8]">per minute</div>
        </div>
        <div className="text-center border-x border-[#1F2937]">
          <div className="text-[16px] font-semibold tabular-nums" style={{ color: TEAL }}>
            ${rateKey === "seattle" ? "0.80" : "1.34"}
          </div>
          <div className="text-[9px] text-[#8B95A8]">per mile</div>
        </div>
        <div className="text-center">
          <div className="text-[16px] font-semibold tabular-nums" style={{ color: TEAL }}>
            ${rateKey === "seattle" ? "5.34" : "3.45"}
          </div>
          <div className="text-[9px] text-[#8B95A8]">{rateKey === "seattle" ? "per offer min." : "per trip min."}</div>
        </div>
      </div>
      <div className="text-[9px] text-[#8B95A8] mb-4">{rates.cite}</div>

      {/* Form */}
      <div className="space-y-3 mb-4">
        <div>
          <label className="section-label block mb-1">Platform</label>
          <select
            data-testid="calc-platform"
            value={platform}
            onChange={e => setPlatform(e.target.value)}
            className="w-full bg-[#101827] border border-[#1F2937] rounded-md text-[12px] text-[#F5F5F5] px-3 py-2 focus:outline-none focus:border-[#26A69A]"
          >
            {["Uber", "Lyft", "DoorDash", "Amazon Flex", "Other"].map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="section-label block mb-1">Hours Worked</label>
            <input
              data-testid="calc-hours"
              type="number" min="0" step="0.25"
              value={hours}
              onChange={e => setHours(e.target.value)}
              placeholder="e.g. 6.5"
              className="w-full bg-[#101827] border border-[#1F2937] rounded-md text-[12px] text-[#F5F5F5] px-3 py-2 focus:outline-none focus:border-[#26A69A] placeholder-[#8B95A8]"
            />
          </div>
          <div>
            <label className="section-label block mb-1">Miles Driven</label>
            <input
              data-testid="calc-miles"
              type="number" min="0" step="1"
              value={miles}
              onChange={e => setMiles(e.target.value)}
              placeholder="e.g. 120"
              className="w-full bg-[#101827] border border-[#1F2937] rounded-md text-[12px] text-[#F5F5F5] px-3 py-2 focus:outline-none focus:border-[#26A69A] placeholder-[#8B95A8]"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="section-label block mb-1">Trips / Offers Completed</label>
            <input
              data-testid="calc-trips"
              type="number" min="0" step="1"
              value={trips}
              onChange={e => setTrips(e.target.value)}
              placeholder="e.g. 18"
              className="w-full bg-[#101827] border border-[#1F2937] rounded-md text-[12px] text-[#F5F5F5] px-3 py-2 focus:outline-none focus:border-[#26A69A] placeholder-[#8B95A8]"
            />
          </div>
          <div>
            <label className="section-label block mb-1">Total Earnings (actual pay)</label>
            <input
              data-testid="calc-earnings"
              type="number" min="0" step="0.01"
              value={earnings}
              onChange={e => setEarnings(e.target.value)}
              placeholder="e.g. 94.50"
              className="w-full bg-[#101827] border border-[#1F2937] rounded-md text-[12px] text-[#F5F5F5] px-3 py-2 focus:outline-none focus:border-[#26A69A] placeholder-[#8B95A8]"
            />
          </div>
        </div>
      </div>

      <button
        data-testid="calc-submit"
        onClick={calculate}
        className="w-full py-2.5 rounded-md text-[12px] font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
        style={{ background: TEAL }}
      >
        Calculate
      </button>

      {/* Results */}
      {result && (
        <div className="mt-4 space-y-2.5">
          <div className="text-[9px] text-[#8B95A8] leading-relaxed px-1">
            {result.breakdown}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#101827] border border-[#1F2937] rounded-md p-3 text-center">
              <div className="text-[10px] text-[#8B95A8] mb-1">Minimum Owed</div>
              <div className="tabular-nums text-[16px] font-semibold text-[#F5F5F5]">{fmt(result.minimum)}</div>
            </div>
            <div className="bg-[#101827] border border-[#1F2937] rounded-md p-3 text-center">
              <div className="text-[10px] text-[#8B95A8] mb-1">Actual Pay</div>
              <div className="tabular-nums text-[16px] font-semibold text-[#F5F5F5]">{fmt(result.actual)}</div>
            </div>
            <div className="bg-[#101827] rounded-md p-3 text-center border"
              style={{ borderColor: result.diff >= 0 ? "rgba(52,211,153,0.3)" : "rgba(232,163,23,0.3)" }}>
              <div className="text-[10px] text-[#8B95A8] mb-1">Difference</div>
              <div className="tabular-nums text-[16px] font-semibold"
                style={{ color: result.diff >= 0 ? "#34D399" : "#E8A317" }}>
                {result.diff >= 0 ? "+" : "–"}{fmt(result.diff)}
              </div>
            </div>
          </div>
          {result.diff < 0 && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-md border"
              style={{ background: "rgba(232,163,23,0.08)", borderColor: "rgba(232,163,23,0.25)" }}>
              <AlertTriangle size={12} style={{ color: "#E8A317" }} className="mt-0.5 shrink-0" />
              <div className="text-[10px] text-[#A3AEC0] leading-relaxed">
                <span className="font-medium text-[#E8A317]">Your pay may be below Seattle's minimum.</span>{" "}
                Contact the Office of Labor Standards: <a href="tel:2062565297" className="underline" style={{ color: TEAL }}>206-256-5297</a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Deactivation Checklist ─────────────────────────────────────────────────
const CHECKLIST_ITEMS = [
  {
    question: "Did the platform provide you with their deactivation policy?",
    noWarning: "Platforms are required to provide deactivation policies under SMC 8.40",
    isYesGood: true,
  },
  {
    question: "Did you receive at least 14 days advance notice before deactivation?",
    noWarning: "14 days notice is required unless for safety, fraud, or legal reasons",
    isYesGood: true,
  },
  {
    question: "Were you given the specific reason for deactivation?",
    noWarning: "Platforms must provide the reason for deactivation",
    isYesGood: true,
  },
  {
    question: "Were you given access to records the platform used in their decision?",
    noWarning: "You have a right to access these records",
    isYesGood: true,
  },
  {
    question: "Did you challenge the deactivation within 90 days?",
    yesNote: "You can challenge internally, then file a private lawsuit",
    isYesGood: true,
  },
  {
    question: "Has it been over 90 days since deactivation?",
    yesWarning: "The 90-day window to challenge may have passed. Contact OLS immediately.",
    isYesGood: false,
  },
];

type CheckState = "yes" | "no" | null;

function DeactivationChecklist() {
  const [checks, setChecks] = useState<CheckState[]>(Array(CHECKLIST_ITEMS.length).fill(null));

  const toggle = (i: number, val: CheckState) => {
    setChecks(prev => {
      const next = [...prev];
      next[i] = prev[i] === val ? null : val;
      return next;
    });
  };

  const violations = checks.reduce((acc, state, i) => {
    const item = CHECKLIST_ITEMS[i];
    if (item.isYesGood && state === "no") return acc + 1;
    if (!item.isYesGood && state === "yes") return acc + 1;
    return acc;
  }, 0);

  const answered = checks.filter(c => c !== null).length;

  return (
    <div className="bg-[#151d2e] border border-[#1F2937] rounded-md p-5 flex flex-col">
      <div className="mb-4">
        <div className="text-[13px] font-semibold text-[#F5F5F5]">Deactivation Rights Checklist</div>
        <div className="text-[10px] text-[#8B95A8] mt-0.5">Know your rights under Seattle Municipal Code 8.40</div>
      </div>

      <div className="space-y-3 flex-1">
        {CHECKLIST_ITEMS.map((item, i) => {
          const state = checks[i];
          const isViolation = state !== null && (
            (item.isYesGood && state === "no") ||
            (!item.isYesGood && state === "yes")
          );
          const showNote = state === "yes" && item.yesNote;
          const showYesWarn = state === "yes" && item.yesWarning;
          const showNoWarn = state === "no" && item.noWarning;

          return (
            <div key={i} className="rounded-md border p-3 transition-colors"
              style={{ borderColor: isViolation ? "rgba(232,163,23,0.3)" : "#1F2937", background: isViolation ? "rgba(232,163,23,0.05)" : "#101827" }}>
              <div className="text-[11px] text-[#F5F5F5] mb-2 leading-relaxed">{item.question}</div>
              <div className="flex items-center gap-2">
                <button
                  data-testid={`checklist-yes-${i}`}
                  onClick={() => toggle(i, "yes")}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-medium transition-all border"
                  style={state === "yes"
                    ? { background: "rgba(52,211,153,0.15)", color: "#34D399", borderColor: "rgba(52,211,153,0.3)" }
                    : { background: "transparent", color: "#8B95A8", borderColor: "#1F2937" }}
                >
                  {state === "yes" ? <CheckCircle2 size={11} /> : <Circle size={11} />} Yes
                </button>
                <button
                  data-testid={`checklist-no-${i}`}
                  onClick={() => toggle(i, "no")}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-medium transition-all border"
                  style={state === "no"
                    ? { background: "rgba(232,163,23,0.15)", color: "#E8A317", borderColor: "rgba(232,163,23,0.3)" }
                    : { background: "transparent", color: "#8B95A8", borderColor: "#1F2937" }}
                >
                  {state === "no" ? <CheckCircle2 size={11} /> : <Circle size={11} />} No
                </button>
              </div>
              {(showNote || showYesWarn || showNoWarn) && (
                <div className="mt-2 text-[10px] leading-relaxed flex items-start gap-1.5"
                  style={{ color: isViolation ? "#E8A317" : TEAL }}>
                  {isViolation && <AlertTriangle size={10} className="mt-0.5 shrink-0" />}
                  {showNote && <span style={{ color: TEAL }}>{item.yesNote}</span>}
                  {showYesWarn && <span>{item.yesWarning}</span>}
                  {showNoWarn && <span>{item.noWarning}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {answered > 0 && (
        <div className="mt-4 p-3 rounded-md border"
          style={{ background: violations > 0 ? "rgba(232,163,23,0.08)" : "rgba(38,166,154,0.08)", borderColor: violations > 0 ? "rgba(232,163,23,0.3)" : "rgba(38,166,154,0.3)" }}>
          <div className="text-[11px] font-medium" style={{ color: violations > 0 ? "#E8A317" : TEAL }}>
            {violations === 0 ? "No violations detected in your answers." : `${violations} potential rights violation${violations > 1 ? "s" : ""} detected.`}
          </div>
          {violations > 0 && (
            <div className="text-[10px] text-[#A3AEC0] mt-1">Document everything and contact OLS immediately.</div>
          )}
        </div>
      )}

      {/* OLS Callout */}
      <div className="mt-4 p-3 rounded-md bg-[#0E3D39]/30 border border-[#1F2937]">
        <div className="text-[10px] font-medium mb-2" style={{ color: TEAL }}>Office of Labor Standards</div>
        <div className="space-y-1.5">
          <a href="tel:2062565297" className="flex items-center gap-2 text-[10px] text-[#A3AEC0] hover:text-[#F5F5F5] transition-colors">
            <Phone size={10} style={{ color: TEAL }} />
            206-256-5297
          </a>
          <a href="mailto:laborstandards@seattle.gov" className="flex items-center gap-2 text-[10px] text-[#A3AEC0] hover:text-[#F5F5F5] transition-colors">
            <Mail size={10} style={{ color: TEAL }} />
            laborstandards@seattle.gov
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function PayCalculatorPage() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="Tools" subtitle="Interactive Worker Tools · Seattle Metro" />
        <main className="flex-1 p-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <PayCalculator />
            <DeactivationChecklist />
          </div>
          <div className="text-[9px] text-[#8B95A8] mt-5 pb-2">
            bullecloud.com · Rate information sourced from Seattle Office of Labor Standards. Not legal advice.
          </div>
        </main>
      </div>
    </div>
  );
}
