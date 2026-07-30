import Layout from "@/components/Layout";
import { BookOpen, ExternalLink, Shield, Globe, Users, BarChart2, AlertTriangle } from "lucide-react";

function SectionCard({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#121212] border border-[#4D4D4D] rounded-md overflow-hidden">
      <div className="px-4 py-3 border-b border-[#4D4D4D]" style={{ background: "#1A1A1A" }}>
        <div className="flex items-center gap-2">
          <Icon size={13} className="text-[#FFFFFF]" />
          <h2 className="text-[13px] font-semibold text-[#FFFFFF]">{title}</h2>
        </div>
      </div>
      <div className="p-4 space-y-2.5 text-[11px] text-[#D9D9D9] leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function BulletItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-[#FFFFFF] mt-1.5 flex-shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#FFFFFF] hover:underline inline-flex items-center gap-0.5">
      {children} <ExternalLink size={9} />
    </a>
  );
}

export default function ResourcesPage() {
  return (
    <Layout title="Resources" subtitle="Statewide & National Resources for App-Based Drivers">
        <main className="flex-1 p-3 md:p-5 space-y-5 overflow-y-auto">

          {/* Intro */}
          <div className="bg-[#1F1F1F] border border-[#C0C0C0]/30 rounded-md px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={14} className="text-[#FFFFFF]" />
              <span className="text-[12px] font-semibold text-[#FFFFFF]">Statewide & National Resources</span>
            </div>
            <p className="text-[11px] text-[#D9D9D9] leading-relaxed">
              Protections, legislation, and organizations supporting app-based drivers at the Washington State and federal level. For Seattle-specific OLS information, see the OLS Data page.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Washington State Protections */}
            <SectionCard icon={Shield} title="Washington State Protections">
              <div className="text-[10px] font-semibold text-[#FFFFFF] mb-1">HB 2076 (signed March 2022)</div>
              <BulletItem>Minimum per-trip payments, paid sick leave, workers' compensation for rideshare drivers statewide</BulletItem>
              <BulletItem>WA rates outside Seattle: <span className="text-[#FFFFFF] font-medium">$0.39/min · $1.34/mile · $3.45 minimum per trip</span></BulletItem>
              <BulletItem>Workers' compensation coverage since <span className="text-[#FFFFFF] font-medium">Jan 1, 2023</span></BulletItem>
              <BulletItem>Paid sick leave: <span className="text-[#FFFFFF] font-medium">1 hour per 40 hours worked</span></BulletItem>
              <BulletItem>Deactivation appeal rights with just-cause standard</BulletItem>
              <BulletItem>Anti-retaliation protections</BulletItem>
              <div className="pt-1 text-[9px] text-[#A6A6A6]">
                Sources:{" "}
                <ExtLink href="https://ogletree.com/insights/washington-state-rideshare-law/">ogletree.com</ExtLink>
                {" · "}
                <ExtLink href="https://www.jacksonlewis.com/insights/washington-enacts-new-app-based-rideshare-driver-protections">jacksonlewis.com</ExtLink>
              </div>
            </SectionCard>

            {/* Federal Legislation */}
            <SectionCard icon={Globe} title="Federal Legislation">
              <div className="text-[10px] font-semibold text-[#FFFFFF] mb-1">Empowering App-Based Workers Act</div>
              <div className="text-[9px] text-[#A6A6A6] mb-2">Introduced July 2025 (Senate) · Dec 2025 (House)</div>
              <div className="text-[10px] text-[#D9D9D9] mb-1.5">
                Sponsors: Sen. Schatz, Sen. Murphy, Rep. Omar, Rep. Jayapal, Rep. Norcross
              </div>
              <BulletItem>Would guarantee ridehail drivers <span className="text-[#FFFFFF] font-medium">75% of each passenger fare</span></BulletItem>
              <BulletItem>Require weekly pay statements and itemized receipts</BulletItem>
              <BulletItem>Disclosure of electronic monitoring and algorithmic decisions</BulletItem>
              <BulletItem>Equal pay for equal work provisions</BulletItem>
              <BulletItem>Strong enforcement with money damages</BulletItem>
              <div className="pt-1 text-[9px] text-[#A6A6A6]">
                Sources:{" "}
                <ExtLink href="https://www.nelp.org/research/empowering-app-based-workers-act/">nelp.org</ExtLink>
                {" · "}
                <ExtLink href="https://www.hrw.org/news/2025/07/empowering-app-based-workers-act">hrw.org</ExtLink>
                {" · "}
                <ExtLink href="https://omar.house.gov/media/press-releases/empowering-app-based-workers-act">omar.house.gov</ExtLink>
              </div>
            </SectionCard>

            {/* Driver Organizations */}
            <SectionCard icon={Users} title="Driver Organizations">
              <div>
                <span className="text-[#FFFFFF] font-medium">Rideshare Drivers United</span>{" "}
                <ExtLink href="https://drivers-united.org">drivers-united.org</ExtLink>
                <div className="mt-1 text-[#D9D9D9]">Independent driver-led association, founded in LA with national scope. Demands: 20% cap on commission, per-mile/per-minute pay, transparent deactivation appeals, driver representatives on company boards.</div>
              </div>
              <div>
                <span className="text-[#FFFFFF] font-medium">National Employment Law Project</span>{" "}
                <ExtLink href="https://www.nelp.org">nelp.org</ExtLink>
                <div className="mt-1 text-[#D9D9D9]">Research and advocacy for gig worker protections at state and federal level.</div>
              </div>
              <div>
                <span className="text-[#FFFFFF] font-medium">Workplace Fairness</span>{" "}
                <ExtLink href="https://www.workplacefairness.org/gigworkers">workplacefairness.org/gigworkers</ExtLink>
                <div className="mt-1 text-[#D9D9D9]">State-by-state gig worker rights guide.</div>
              </div>
            </SectionCard>

            {/* Safety & Regulatory Bodies */}
            <SectionCard icon={AlertTriangle} title="Safety & Regulatory Bodies">
              <div>
                <span className="text-[#FFFFFF] font-medium">NHTSA</span>{" "}
                <ExtLink href="https://www.nhtsa.gov">nhtsa.gov</ExtLink>
                <div className="mt-1 text-[#D9D9D9]">Road safety research and crash data relevant to rideshare drivers.</div>
              </div>
              <div>
                <span className="text-[#FFFFFF] font-medium">Governors Highway Safety Association</span>{" "}
                <ExtLink href="https://www.ghsa.org">ghsa.org</ExtLink>
                <div className="mt-1 text-[#D9D9D9]">Partnered with Uber on ridesharing safety campaigns and best practices.</div>
              </div>
              <div>
                <span className="text-[#FFFFFF] font-medium">National Sheriffs' Association</span>
                <div className="mt-1 text-[#D9D9D9]">Ridesharing safety resources and law enforcement coordination.</div>
              </div>
            </SectionCard>
          </div>

          {/* Key Statistics */}
          <div className="bg-[#121212] border border-[#4D4D4D] rounded-md overflow-hidden">
            <div className="px-4 py-3 border-b border-[#4D4D4D]" style={{ background: "#1A1A1A" }}>
              <div className="flex items-center gap-2">
                <BarChart2 size={13} className="text-[#FFFFFF]" />
                <h2 className="text-[13px] font-semibold text-[#FFFFFF]">Key Statistics</h2>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  {
                    stat: "~16%",
                    desc: "of Americans have done app-based work",
                    source: "HRW",
                    sourceUrl: "https://www.hrw.org",
                  },
                  {
                    stat: "40%+",
                    desc: "of fares regularly kept by Uber/Lyft in 2024 (up to 70% on some rides), while paying below minimum wage",
                    source: "NELP",
                    sourceUrl: "https://www.nelp.org",
                  },
                  {
                    stat: "Every 8 min",
                    desc: "A sexual assault report was filed against Uber from 2017–2022 on average",
                    source: "NYT / Fox News",
                    sourceUrl: "https://www.nytimes.com",
                  },
                  {
                    stat: "Feb 2026",
                    desc: "Uber announced policy changes to ban violent felons regardless of conviction age",
                    source: "Uber Policy Update",
                    sourceUrl: "https://www.uber.com",
                  },
                ].map(({ stat, desc, source, sourceUrl }) => (
                  <div key={stat} className="bg-[#121212] rounded-md p-3 flex gap-3 items-start">
                    <div className="text-[20px] font-bold text-[#FFFFFF] tabular-nums leading-none min-w-[4rem] flex-shrink-0">{stat}</div>
                    <div>
                      <div className="text-[10px] text-[#D9D9D9] leading-relaxed">{desc}</div>
                      <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[8px] text-[#FFFFFF] hover:underline mt-0.5 inline-block">{source} ↗</a>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-[9px] text-[#A6A6A6]">
                App workers are disproportionately Black, immigrant, and workers of color (<a href="https://www.nelp.org" target="_blank" rel="noopener noreferrer" className="text-[#FFFFFF] hover:underline">NELP</a>).
              </div>
            </div>
          </div>

          <div className="text-[9px] text-[#A6A6A6] pb-2">
            Sources: NELP (nelp.org) · HRW (hrw.org) · Ogletree (ogletree.com) · Jackson Lewis (jacksonlewis.com) · omar.house.gov · drivers-united.org · workplacefairness.org. bullecloud.com
          </div>
        </main>
    </Layout>
  );
}
