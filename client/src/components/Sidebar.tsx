import { Link } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { LayoutDashboard, Map, List, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/map", label: "Crime Map", icon: Map },
  { href: "/incidents", label: "Incidents", icon: List },
  { href: "/live", label: "Live Feed", icon: Radio },
];

export default function Sidebar() {
  const [location] = useHashLocation();

  return (
    <aside className="sidebar flex flex-col h-full">
      <div className="seattle-accent" />
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2.5 mb-2">
          {/* Bulle Cloud logo — teal rounded square with cloud + B */}
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none" aria-label="Bulle Cloud">
            <rect width="40" height="40" rx="8" fill="#0046AD"/>
            <path d="M28.5 21.5C28.5 19 26.8 17 24.5 16.6C23.8 14.5 21.9 13 19.5 13C16.7 13 14.5 15.2 14.5 18c0 .1 0 .2 0 .3C12.8 18.8 11.5 20.4 11.5 22.3c0 2.2 1.8 4 4 4H27.5c.6 0 1-.5 1-1V21.5Z" fill="white" opacity=".9"/>
            <text x="18" y="24" fontFamily="Arial,sans-serif" fontSize="7" fontWeight="800" fill="#0046AD">B</text>
          </svg>
          <div>
            <div className="text-[8.5px] font-semibold text-[#0046AD] tracking-wide uppercase leading-tight">Bulle Cloud</div>
          </div>
        </div>
        <div className="text-[12px] font-semibold text-[#231F20] mt-1">Seattle App-Based</div>
        <div className="text-[12px] font-semibold text-[#231F20]">Driver Safety</div>
        <div className="text-[9px] text-[#939598] mt-0.5">Safety Intelligence Dashboard</div>

        <div className="mt-2.5 text-[9px] text-[#939598]">
          Data current as of Apr 14, 2026
        </div>
      </div>

      <div className="h-px bg-[#D3E0E8] mx-4" />

      <nav className="flex-1 px-3 pt-3">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = location === href;
          return (
            <Link key={href} href={href}>
              <div
                data-testid={`nav-${label.toLowerCase().replace(' ', '-')}`}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded mb-px cursor-pointer transition-colors text-[12px] select-none",
                  active
                    ? "bg-[#EDF4FC] text-[#0046AD] font-medium"
                    : "text-[#6B6B6D] hover:text-[#231F20] hover:bg-white font-normal"
                )}
              >
                <Icon size={13} className={active ? "text-[#0046AD]" : "text-[#939598]"} />
                {label}
                {label === "Live Feed" && <span className="ml-auto pulse-dot" />}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-4 pt-2 text-[8px] text-[#B5B8BC] leading-relaxed">
        <div className="mb-1.5">SPD Open Data · SPD Blotter · Cascade PBS · KOMO · KIRO 7 · Fox 13 · King Co. Prosecutors</div>
        <div className="text-[#939598]">2024–Present · Seattle Metro</div>
        <div className="mt-1.5 text-[#0046AD]/60 font-medium">bullecloud.com</div>
      </div>
    </aside>
  );
}
