import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Shield, Phone, Mail, Globe, MapPin, AlertTriangle, CheckCircle, Clock, Users, DollarSign, BarChart2, TrendingUp } from "lucide-react";

function RateTable({ rates }: { rates: { year: string; perMin: string; perMile: string; perOffer: string }[] }) {
  return (
    <div className="overflow-x-auto mt-3">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="bg-[#FFFFFF] border-b border-[#C7EEF4]">
            <th className="px-3 py-2 text-left text-[9px] font-medium text-[#44536B] uppercase tracking-wider">Year</th>
            <th className="px-3 py-2 text-left text-[9px] font-medium text-[#44536B] uppercase tracking-wider">Per Minute</th>
            <th className="px-3 py-2 text-left text-[9px] font-medium text-[#44536B] uppercase tracking-wider">Per Mile</th>
            <th className="px-3 py-2 text-left text-[9px] font-medium text-[#44536B] uppercase tracking-wider">Per Offer Min.</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#C7EEF4]">
          {rates.map((r, i) => (
            <tr key={r.year} className={i === 0 ? "bg-[#FFFFFF]" : ""}>
              <td className="px-3 py-2 font-medium" style={{ color: i === 0 ? "#061A3A" : "#222222" }}>{r.year}</td>
              <td className="px-3 py-2 tabular-nums text-[#061A3A] font-medium">{r.perMin}</td>
              <td className="px-3 py-2 tabular-nums text-[#061A3A] font-medium">{r.perMile}</td>
              <td className="px-3 py-2 tabular-nums text-[#061A3A] font-medium">{r.perOffer}</td>
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
      <Icon size={13} className="text-[#061A3A] mt-0.5 flex-shrink-0" />
      <span className="text-[11px] text-[#222222] leading-relaxed">{text}</span>
    </div>
  );
}

export default function WorkerRightsPage() {
  const { data: stats } = useQuery<any>({
    queryKey: ["/api/stats"],
    queryFn: () => apiRequest("GET", "/api/stats").then(r => r.json()),
  });

  return (
    <Layout title="OLS Data" subtitle="Seattle Office of Labor Standards · App-Based Worker Data & Rights">
        <main className="flex-1 p-3 md:p-5 space-y-5 overflow-y-auto">

          {/* Intro */}
          <div className="bg-[#EFF7F8] border border-[#C7EEF4]/30 rounded-md px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield size={14} className="text-[#061A3A]" />
              <span className="text-[12px] font-semibold text-[#061A3A]">Seattle Office of Labor Standards (OLS)</span>
            </div>
            <p className="text-[11px] text-[#222222] leading-relaxed">
              The City of Seattle has enacted three landmark ordinances protecting app-based workers — including rideshare drivers and delivery workers — on platforms like Uber, Lyft, DoorDash, and Amazon Flex. These laws apply to companies with 250+ workers worldwide.
            </p>
          </div>

          {/* Seattle App-Based Driver Data */}
          <div>
            <div className="text-[11px] font-semibold text-[#061A3A] mb-3 flex items-center gap-2">
              <BarChart2 size={13} className="text-[#061A3A]" />
              Seattle App-Based Driver Data
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

              {/* Active Drivers */}
              <div className="bg-[#FFFFFF] border border-[#C7EEF4] rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={13} className="text-[#061A3A]" />
                  <span className="text-[10px] font-semibold text-[#061A3A]">Active Drivers</span>
                </div>
                <div className="tabular-nums text-[26px] font-bold text-[#061A3A] leading-none mb-1">24,700+</div>
                <div className="text-[9px] text-[#222222] leading-relaxed">
                  Active Uber drivers in Seattle (<span className="text-[#44536B]">Seattle Times 2024</span>). Thousands more on Lyft, DoorDash, Amazon Flex. Growing workforce.
                </div>
              </div>

              {/* Pay Rates */}
              <div className="bg-[#FFFFFF] border border-[#C7EEF4] rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={13} className="text-[#061A3A]" />
                  <span className="text-[10px] font-semibold text-[#061A3A]">Pay Rates (Seattle 2026)</span>
                </div>
                <div className="space-y-1.5 mt-2">
                  {[
                    { label: "Per minute", value: "$0.47" },
                    { label: "Per mile", value: "$0.80" },
                    { label: "Per offer minimum", value: "$5.34" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-[10px] text-[#222222]">{label}</span>
                      <span className="text-[11px] font-semibold tabular-nums text-[#061A3A]">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="text-[8px] text-[#44536B] mt-2">Source: SMC 8.37</div>
              </div>

              {/* Worker Demographics */}
              <div className="bg-[#FFFFFF] border border-[#C7EEF4] rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={13} className="text-[#061A3A]" />
                  <span className="text-[10px] font-semibold text-[#061A3A]">Worker Demographics</span>
                </div>
                <div className="text-[10px] text-[#222222] leading-relaxed space-y-1.5">
                  <div>Disproportionately immigrants and communities of color.</div>
                  <div><span className="text-[#061A3A] font-medium">~16%</span> of Americans have done app-based work <span className="text-[#44536B]">(HRW 2025)</span>.</div>
                  <div>Somali, Ethiopian, and East African drivers are among the largest demographic groups in Seattle.</div>
                </div>
              </div>

              {/* Safety Incidents */}
              <div className="bg-[#FFFFFF] border border-[#C7EEF4] rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={13} className="text-[#061A3A]" />
                  <span className="text-[10px] font-semibold text-[#061A3A]">Safety Incidents Tracked</span>
                </div>
                <div className="tabular-nums text-[26px] font-bold text-[#061A3A] leading-none mb-1">
                  {stats?.crimeTotal ?? "—"}
                </div>
                <div className="text-[9px] text-[#222222] leading-relaxed mb-2">
                  verified incidents tracked since 2024
                </div>
                <a href="/#/" className="text-[9px] text-[#061A3A] hover:underline">
                  View Overview →
                </a>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Ordinance A: Minimum Payment */}
            <div className="bg-[#FFFFFF] border border-[#C7EEF4] rounded-md overflow-hidden">
              <div className="px-4 py-3 border-b border-[#C7EEF4]" style={{ background: "#FFFFFF" }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[8px] font-semibold bg-[#20BAD1]/20 text-[#061A3A] px-1.5 py-0.5 rounded uppercase tracking-wider">SMC 8.37</span>
                  <Clock size={11} className="text-[#44536B]" />
                  <span className="text-[9px] text-[#44536B]">Effective Jan 13, 2024</span>
                </div>
                <h2 className="text-[13px] font-semibold text-[#061A3A]">Minimum Payment Ordinance</h2>
                <p className="text-[10px] text-[#222222] mt-0.5">Minimum pay, transparency & flexibility rights</p>
              </div>
              <div className="p-4">
                <div className="section-label mb-2">Pay Rates</div>
                <RateTable rates={[
                  { year: "2026", perMin: "$0.47", perMile: "$0.80", perOffer: "$5.34" },
                  { year: "2025", perMin: "$0.45", perMile: "$0.77", perOffer: "$5.20" },
                  { year: "2024", perMin: "$0.44", perMile: "$0.74", perOffer: "$5.00" },
                ]} />
                <div className="section-label mt-4 mb-2">Key Rights</div>
                <div className="divide-y divide-[#C7EEF4]">
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
            <div className="bg-[#FFFFFF] border border-[#C7EEF4] rounded-md overflow-hidden">
              <div className="px-4 py-3 border-b border-[#C7EEF4]" style={{ background: "#FFFFFF" }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[8px] font-semibold bg-[#20BAD1]/20 text-[#061A3A] px-1.5 py-0.5 rounded uppercase tracking-wider">SMC 8.39</span>
                  <Clock size={11} className="text-[#44536B]" />
                  <span className="text-[9px] text-[#44536B]">Effective May 1, 2023 / Jan 13, 2024</span>
                </div>
                <h2 className="text-[13px] font-semibold text-[#061A3A]">Paid Sick & Safe Time</h2>
                <p className="text-[10px] text-[#222222] mt-0.5">Paid leave for health, safety, and family needs</p>
              </div>
              <div className="p-4">
                <div className="section-label mb-2">Accrual & Use</div>
                <div className="bg-[#FFFFFF] rounded p-3 mb-3 text-center">
                  <div className="text-[24px] font-bold text-[#061A3A] tabular-nums">1 day</div>
                  <div className="text-[10px] text-[#222222] mt-0.5">per 30 days with at least one Seattle work stop</div>
                </div>
                <div className="space-y-2 text-[11px] text-[#222222]">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#20BAD1] flex-shrink-0" />
                    <span>Use in <strong className="text-[#061A3A]">24-hour increments</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#20BAD1] flex-shrink-0" />
                    <span>Rate: <strong className="text-[#061A3A]">average daily compensation</strong> over preceding 12 months</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#20BAD1] flex-shrink-0" />
                    <span>Recalculated monthly by the platform</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#20BAD1] flex-shrink-0" />
                    <span>Verification only required after <strong className="text-[#061A3A]">3+ consecutive days</strong></span>
                  </div>
                </div>
                <div className="section-label mt-4 mb-2">Covered Uses</div>
                <div className="divide-y divide-[#C7EEF4]">
                  <Right icon={CheckCircle} text="Your own illness or medical appointment" />
                  <Right icon={CheckCircle} text="Care for a family member's health needs" />
                  <Right icon={CheckCircle} text="Domestic violence, sexual assault, or stalking recovery" />
                  <Right icon={CheckCircle} text="School or childcare closures due to public health emergency" />
                  <Right icon={CheckCircle} text="Safety needs related to domestic violence situations" />
                </div>
                <div className="mt-3 text-[9px] text-[#44536B]">Effective May 1, 2023 for food delivery workers; Jan 13, 2024 for all app-based workers. Applies to companies with 250+ workers worldwide.</div>
              </div>
            </div>

            {/* Ordinance C: Deactivation Rights */}
            <div className="bg-[#FFFFFF] border border-[#C7EEF4] rounded-md overflow-hidden">
              <div className="px-4 py-3 border-b border-[#C7EEF4]" style={{ background: "#FFFFFF" }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[8px] font-semibold bg-[#20BAD1]/20 text-[#061A3A] px-1.5 py-0.5 rounded uppercase tracking-wider">SMC 8.40</span>
                  <Clock size={11} className="text-[#44536B]" />
                  <span className="text-[9px] text-[#44536B]">Effective Jan 1, 2025</span>
                </div>
                <h2 className="text-[13px] font-semibold text-[#061A3A]">Deactivation Rights Ordinance</h2>
                <p className="text-[10px] text-[#222222] mt-0.5">Protection from unfair platform deactivation</p>
              </div>
              <div className="p-4">
                <div className="section-label mb-2">Key Protections</div>
                <div className="divide-y divide-[#C7EEF4]">
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
                  <div className="bg-[#EFF7F8] border border-[#C7EEF4]/20 rounded p-2.5">
                    <div className="text-[10px] font-medium text-[#061A3A] mb-1">Ninth Circuit — March 2026</div>
                    <div className="text-[9px] text-[#222222]">Court upheld this ordinance against challenges by Uber and Instacart</div>
                  </div>
                  <div className="bg-[#FFFFFF] border border-[#C7EEF4] rounded p-2.5">
                    <div className="text-[10px] font-medium text-[#061A3A] mb-1">Limited Enforcement (Jan 2025 – May 2027)</div>
                    <div className="text-[9px] text-[#222222]">OLS can investigate procedural compliance only. Cannot investigate "permissible reason" until June 2027. Admin rules effective June 24, 2025.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* File a Complaint */}
          <div className="bg-[#FFFFFF] border border-[#C7EEF4] rounded-md p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={14} className="text-[#061A3A]" />
              <span className="text-[12px] font-semibold text-[#061A3A]">File a Complaint</span>
            </div>
            <p className="text-[11px] text-[#222222] mb-3">If you believe your rights have been violated, you can file a complaint with OLS. Workers are protected from retaliation for exercising their rights.</p>
            <div className="flex flex-wrap gap-3">
              <a href="tel:206-256-5297" className="flex items-center gap-2 bg-[#FFFFFF] border border-[#C7EEF4] rounded px-3 py-2 text-[11px] text-[#061A3A] hover:border-[#63CFDF] transition-colors">
                <Phone size={12} className="text-[#061A3A]" /> 206-256-5297
              </a>
              <a href="mailto:laborstandards@seattle.gov" className="flex items-center gap-2 bg-[#FFFFFF] border border-[#C7EEF4] rounded px-3 py-2 text-[11px] text-[#061A3A] hover:border-[#63CFDF] transition-colors">
                <Mail size={12} className="text-[#061A3A]" /> laborstandards@seattle.gov
              </a>
              <a href="https://seattle.gov/laborstandards" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#FFFFFF] border border-[#C7EEF4] rounded px-3 py-2 text-[11px] text-[#061A3A] hover:border-[#63CFDF] transition-colors">
                <Globe size={12} /> seattle.gov/laborstandards
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-[#FFFFFF] border border-[#C7EEF4] rounded-md p-4">
            <div className="section-label mb-3">OLS Contact Information</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="flex items-start gap-2.5">
                <Phone size={13} className="text-[#061A3A] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-[9px] text-[#44536B] uppercase tracking-wide mb-0.5">Phone</div>
                  <a href="tel:206-256-5297" className="text-[11px] text-[#061A3A] hover:text-[#061A3A] transition-colors">206-256-5297</a>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail size={13} className="text-[#061A3A] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-[9px] text-[#44536B] uppercase tracking-wide mb-0.5">Email</div>
                  <a href="mailto:laborstandards@seattle.gov" className="text-[11px] text-[#061A3A] hover:underline">laborstandards@seattle.gov</a>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Globe size={13} className="text-[#061A3A] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-[9px] text-[#44536B] uppercase tracking-wide mb-0.5">Web</div>
                  <a href="https://seattle.gov/laborstandards" target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#061A3A] hover:underline">seattle.gov/laborstandards</a>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin size={13} className="text-[#061A3A] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-[9px] text-[#44536B] uppercase tracking-wide mb-0.5">Address</div>
                  <div className="text-[11px] text-[#222222] leading-relaxed">810 3rd Avenue, Suite 375<br />Seattle, WA 98104</div>
                </div>
              </div>
            </div>
          </div>

          {/* Seattle-Specific Resources */}
          <div className="bg-[#FFFFFF] border border-[#C7EEF4] rounded-md p-4">
            <div className="section-label mb-3">Seattle-Specific Resources</div>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#20BAD1] mt-1.5 flex-shrink-0" />
                <span className="text-[#222222]"><span className="text-[#061A3A] font-medium">WA State Driver Resource Center</span> — funded by HB 2076 passenger fees, providing support services for app-based drivers statewide</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#20BAD1] mt-1.5 flex-shrink-0" />
                <span className="text-[#222222]"><span className="text-[#061A3A] font-medium">Seattle OLS:</span>{" "}
                  <a href="https://seattle.gov/laborstandards" target="_blank" rel="noopener noreferrer" className="text-[#061A3A] hover:underline">seattle.gov/laborstandards</a>
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#20BAD1] mt-1.5 flex-shrink-0" />
                <span className="text-[#222222]"><span className="text-[#061A3A] font-medium">OLS Phone:</span>{" "}
                  <a href="tel:206-256-5297" className="text-[#061A3A] hover:underline">206-256-5297</a>
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#20BAD1] mt-1.5 flex-shrink-0" />
                <span className="text-[#222222]"><span className="text-[#061A3A] font-medium">OLS Email:</span>{" "}
                  <a href="mailto:laborstandards@seattle.gov" className="text-[#061A3A] hover:underline">laborstandards@seattle.gov</a>
                </span>
              </div>
            </div>
          </div>

          <div className="text-[9px] text-[#44536B] pb-2">
            Information sourced from Seattle Office of Labor Standards ordinances SMC 8.37, 8.39, 8.40. Rates updated annually. bullecloud.com
          </div>
        </main>
    </Layout>
  );
}
