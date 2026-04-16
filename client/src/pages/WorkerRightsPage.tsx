import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Shield, Phone, Mail, Globe, MapPin, AlertTriangle, CheckCircle, Clock } from "lucide-react";

function RateTable({ rates }: { rates: { year: string; perMin: string; perMile: string; perOffer: string }[] }) {
  return (
    <div className="overflow-x-auto mt-3">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="bg-[#0f172a] border-b border-[#334155]">
            <th className="px-3 py-2 text-left text-[9px] font-medium text-[#64748b] uppercase tracking-wider">Year</th>
            <th className="px-3 py-2 text-left text-[9px] font-medium text-[#64748b] uppercase tracking-wider">Per Minute</th>
            <th className="px-3 py-2 text-left text-[9px] font-medium text-[#64748b] uppercase tracking-wider">Per Mile</th>
            <th className="px-3 py-2 text-left text-[9px] font-medium text-[#64748b] uppercase tracking-wider">Per Offer Min.</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#334155]">
          {rates.map((r, i) => (
            <tr key={r.year} className={i === 0 ? "bg-[rgba(13,148,136,0.08)]" : ""}>
              <td className="px-3 py-2 font-medium" style={{ color: i === 0 ? "#2dd4bf" : "#94a3b8" }}>{r.year}</td>
              <td className="px-3 py-2 tabular-nums text-[#e2e8f0] font-medium">{r.perMin}</td>
              <td className="px-3 py-2 tabular-nums text-[#e2e8f0] font-medium">{r.perMile}</td>
              <td className="px-3 py-2 tabular-nums text-[#e2e8f0] font-medium">{r.perOffer}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Right({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-start gap-2.5 py-2">
      <Icon size={13} className="text-[#0d9488] mt-0.5 flex-shrink-0" />
      <span className="text-[11px] text-[#94a3b8] leading-relaxed">{text}</span>
    </div>
  );
}

export default function WorkerRightsPage() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <Header title="Worker Rights" subtitle="Seattle Office of Labor Standards · App-Based Worker Protections" />
        <main className="flex-1 p-5 space-y-5 overflow-y-auto">

          {/* Intro */}
          <div className="bg-[rgba(13,148,136,0.1)] border border-[#0d9488]/30 rounded-md px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield size={14} className="text-[#0d9488]" />
              <span className="text-[12px] font-semibold text-[#2dd4bf]">Seattle Office of Labor Standards (OLS)</span>
            </div>
            <p className="text-[11px] text-[#94a3b8] leading-relaxed">
              The City of Seattle has enacted three landmark ordinances protecting app-based workers — including rideshare drivers and delivery workers — on platforms like Uber, Lyft, DoorDash, and Amazon Flex. These laws apply to companies with 250+ workers worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

            {/* Ordinance A: Minimum Payment */}
            <div className="bg-[#1e293b] border border-[#334155] rounded-md overflow-hidden">
              <div className="px-4 py-3 border-b border-[#334155]" style={{ background: "rgba(13,148,136,0.08)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[8px] font-semibold bg-[#0d9488]/20 text-[#2dd4bf] px-1.5 py-0.5 rounded uppercase tracking-wider">SMC 8.37</span>
                  <Clock size={11} className="text-[#64748b]" />
                  <span className="text-[9px] text-[#64748b]">Effective Jan 13, 2024</span>
                </div>
                <h2 className="text-[13px] font-semibold text-[#e2e8f0]">Minimum Payment Ordinance</h2>
                <p className="text-[10px] text-[#94a3b8] mt-0.5">Minimum pay, transparency & flexibility rights</p>
              </div>
              <div className="p-4">
                <div className="section-label mb-2">Pay Rates</div>
                <RateTable rates={[
                  { year: "2026", perMin: "$0.47", perMile: "$0.80", perOffer: "$5.34" },
                  { year: "2025", perMin: "$0.45", perMile: "$0.77", perOffer: "$5.20" },
                  { year: "2024", perMin: "$0.44", perMile: "$0.74", perOffer: "$5.00" },
                ]} />
                <div className="section-label mt-4 mb-2">Key Rights</div>
                <div className="divide-y divide-[#334155]">
                  <Right icon={CheckCircle} text="Guaranteed minimum pay per minute and per mile while on a trip" />
                  <Right icon={CheckCircle} text="Minimum offer amount for each delivery or ride offer" />
                  <Right icon={CheckCircle} text="Transparency: companies must show pay details before offer acceptance" />
                  <Right icon={CheckCircle} text="Flexibility: workers can accept or decline offers without penalty" />
                  <Right icon={CheckCircle} text="No penalization for refusing offers below the minimum rate" />
                  <Right icon={CheckCircle} text="Network companies must report records quarterly to OLS" />
                  <Right icon={CheckCircle} text="Companies must be licensed and pay a 10-cent fee per order" />
                </div>
              </div>
            </div>

            {/* Ordinance B: Paid Sick & Safe Time */}
            <div className="bg-[#1e293b] border border-[#334155] rounded-md overflow-hidden">
              <div className="px-4 py-3 border-b border-[#334155]" style={{ background: "rgba(13,148,136,0.08)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[8px] font-semibold bg-[#0d9488]/20 text-[#2dd4bf] px-1.5 py-0.5 rounded uppercase tracking-wider">SMC 8.39</span>
                  <Clock size={11} className="text-[#64748b]" />
                  <span className="text-[9px] text-[#64748b]">Effective May 1, 2023 / Jan 13, 2024</span>
                </div>
                <h2 className="text-[13px] font-semibold text-[#e2e8f0]">Paid Sick & Safe Time</h2>
                <p className="text-[10px] text-[#94a3b8] mt-0.5">Paid leave for health, safety, and family needs</p>
              </div>
              <div className="p-4">
                <div className="section-label mb-2">Accrual & Use</div>
                <div className="bg-[#0f172a] rounded p-3 mb-3 text-center">
                  <div className="text-[24px] font-bold text-[#2dd4bf] tabular-nums">1 day</div>
                  <div className="text-[10px] text-[#94a3b8] mt-0.5">per 30 days with at least one Seattle work stop</div>
                </div>
                <div className="space-y-2 text-[11px] text-[#94a3b8]">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488] flex-shrink-0" />
                    <span>Use in <strong className="text-[#e2e8f0]">24-hour increments</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488] flex-shrink-0" />
                    <span>Rate: <strong className="text-[#e2e8f0]">average daily compensation</strong> over preceding 12 months</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488] flex-shrink-0" />
                    <span>Recalculated monthly by the platform</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488] flex-shrink-0" />
                    <span>Verification only required after <strong className="text-[#e2e8f0]">3+ consecutive days</strong></span>
                  </div>
                </div>
                <div className="section-label mt-4 mb-2">Covered Uses</div>
                <div className="divide-y divide-[#334155]">
                  <Right icon={CheckCircle} text="Your own illness or medical appointment" />
                  <Right icon={CheckCircle} text="Care for a family member's health needs" />
                  <Right icon={CheckCircle} text="Domestic violence, sexual assault, or stalking recovery" />
                  <Right icon={CheckCircle} text="School or childcare closures due to public health emergency" />
                  <Right icon={CheckCircle} text="Safety needs related to domestic violence situations" />
                </div>
                <div className="mt-3 text-[9px] text-[#64748b]">Effective May 1, 2023 for food delivery workers; Jan 13, 2024 for all app-based workers. Applies to companies with 250+ workers worldwide.</div>
              </div>
            </div>

            {/* Ordinance C: Deactivation Rights */}
            <div className="bg-[#1e293b] border border-[#334155] rounded-md overflow-hidden">
              <div className="px-4 py-3 border-b border-[#334155]" style={{ background: "rgba(13,148,136,0.08)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[8px] font-semibold bg-[#0d9488]/20 text-[#2dd4bf] px-1.5 py-0.5 rounded uppercase tracking-wider">SMC 8.40</span>
                  <Clock size={11} className="text-[#64748b]" />
                  <span className="text-[9px] text-[#64748b]">Effective Jan 1, 2025</span>
                </div>
                <h2 className="text-[13px] font-semibold text-[#e2e8f0]">Deactivation Rights Ordinance</h2>
                <p className="text-[10px] text-[#94a3b8] mt-0.5">Protection from unfair platform deactivation</p>
              </div>
              <div className="p-4">
                <div className="section-label mb-2">Key Protections</div>
                <div className="divide-y divide-[#334155]">
                  <Right icon={Shield} text="Certain deactivations are unlawful — platforms must have lawful reason" />
                  <Right icon={Shield} text="Platforms must provide deactivation policies in advance" />
                  <Right icon={Shield} text="Must follow procedural steps before any deactivation" />
                  <Right icon={Shield} text="14 days advance notice required before deactivation" />
                  <Right icon={Shield} text="Must provide access to your records upon request" />
                  <Right icon={Shield} text="Workers can challenge deactivation internally within 90 days" />
                  <Right icon={Shield} text="Workers may file a private lawsuit after internal challenge" />
                </div>
                <div className="section-label mt-4 mb-2">Enforcement Status</div>
                <div className="space-y-2">
                  <div className="bg-[rgba(13,148,136,0.08)] border border-[#0d9488]/20 rounded p-2.5">
                    <div className="text-[10px] font-medium text-[#2dd4bf] mb-1">Ninth Circuit — March 2026</div>
                    <div className="text-[9px] text-[#94a3b8]">Court upheld this ordinance against challenges by Uber and Instacart</div>
                  </div>
                  <div className="bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)] rounded p-2.5">
                    <div className="text-[10px] font-medium text-[#fbbf24] mb-1">Limited Enforcement (Jan 2025 – May 2027)</div>
                    <div className="text-[9px] text-[#94a3b8]">OLS can investigate procedural compliance only. Cannot investigate "permissible reason" until June 2027. Admin rules effective June 24, 2025.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* File a Complaint */}
          <div className="bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)] rounded-md p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={14} className="text-[#f59e0b]" />
              <span className="text-[12px] font-semibold text-[#fbbf24]">File a Complaint</span>
            </div>
            <p className="text-[11px] text-[#94a3b8] mb-3">If you believe your rights have been violated, you can file a complaint with OLS. Workers are protected from retaliation for exercising their rights.</p>
            <div className="flex flex-wrap gap-3">
              <a href="tel:206-256-5297" className="flex items-center gap-2 bg-[#1e293b] border border-[#334155] rounded px-3 py-2 text-[11px] text-[#e2e8f0] hover:border-[#475569] transition-colors">
                <Phone size={12} className="text-[#0d9488]" /> 206-256-5297
              </a>
              <a href="mailto:laborstandards@seattle.gov" className="flex items-center gap-2 bg-[#1e293b] border border-[#334155] rounded px-3 py-2 text-[11px] text-[#e2e8f0] hover:border-[#475569] transition-colors">
                <Mail size={12} className="text-[#0d9488]" /> laborstandards@seattle.gov
              </a>
              <a href="https://seattle.gov/laborstandards" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#1e293b] border border-[#334155] rounded px-3 py-2 text-[11px] text-[#0d9488] hover:border-[#475569] transition-colors">
                <Globe size={12} /> seattle.gov/laborstandards
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-[#1e293b] border border-[#334155] rounded-md p-4">
            <div className="section-label mb-3">OLS Contact Information</div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              <div className="flex items-start gap-2.5">
                <Phone size={13} className="text-[#0d9488] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-[9px] text-[#64748b] uppercase tracking-wide mb-0.5">Phone</div>
                  <a href="tel:206-256-5297" className="text-[11px] text-[#e2e8f0] hover:text-[#2dd4bf] transition-colors">206-256-5297</a>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail size={13} className="text-[#0d9488] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-[9px] text-[#64748b] uppercase tracking-wide mb-0.5">Email</div>
                  <a href="mailto:laborstandards@seattle.gov" className="text-[11px] text-[#2dd4bf] hover:underline">laborstandards@seattle.gov</a>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Globe size={13} className="text-[#0d9488] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-[9px] text-[#64748b] uppercase tracking-wide mb-0.5">Web</div>
                  <a href="https://seattle.gov/laborstandards" target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#2dd4bf] hover:underline">seattle.gov/laborstandards</a>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin size={13} className="text-[#0d9488] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-[9px] text-[#64748b] uppercase tracking-wide mb-0.5">Address</div>
                  <div className="text-[11px] text-[#94a3b8] leading-relaxed">810 3rd Avenue, Suite 375<br />Seattle, WA 98104</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[9px] text-[#64748b] pb-2">
            Information sourced from Seattle Office of Labor Standards ordinances SMC 8.37, 8.39, 8.40. Rates updated annually. Powered by Bulle Cloud · bullecloud.com
          </div>
        </main>
      </div>
    </div>
  );
}
