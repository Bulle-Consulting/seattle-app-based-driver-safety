import { Link } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { LayoutDashboard, Map, List, Radio, Shield, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/map", label: "Crime Map", icon: Map },
  { href: "/incidents", label: "Incidents", icon: List },
  { href: "/live", label: "Live Feed", icon: Radio },
  { href: "/worker-rights", label: "OLS Data", icon: Shield },
  { href: "/resources", label: "Resources", icon: BookOpen },
];

export default function Sidebar() {
  const [location] = useHashLocation();

  return (
    <aside className="sidebar flex flex-col h-full">
      {/* Logo area */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none" aria-label="Bulle Cloud">
            <rect width="40" height="40" rx="10" fill="hsl(176 65% 42%)"/>
            <path d="M28.5 21.5C28.5 19 26.8 17 24.5 16.6C23.8 14.5 21.9 13 19.5 13C16.7 13 14.5 15.2 14.5 18c0 .1 0 .2 0 .3C12.8 18.8 11.5 20.4 11.5 22.3c0 2.2 1.8 4 4 4H27.5c.6 0 1-.5 1-1V21.5Z" fill="white" opacity=".85"/>
          </svg>
          <div>
            <div className="text-[10px] font-medium tracking-[0.08em] uppercase" style={{ color: "hsl(176 65% 42%)" }}>Bulle Cloud</div>
            <div className="text-[13px] font-semibold text-[#F5F5F5] leading-tight">Safety Steward</div>
          </div>
        </div>
        <div className="mt-4 text-[10px] text-[#8B95A8]">
          App-Based Driver Safety
        </div>
        <div className="mt-1 text-[10px] text-[#8B95A8]">
          Data current as of Apr 17, 2026
        </div>
      </div>

      <div className="h-px mx-5" style={{ background: "hsl(220 25% 16%)" }} />

      {/* Nav */}
      <nav className="flex-1 px-3 pt-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = location === href;
          return (
            <Link key={href} href={href}>
              <div
                data-testid={`nav-${label.toLowerCase().replace(' ', '-')}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 text-[12.5px] select-none",
                  active
                    ? "text-white font-medium"
                    : "text-[#8B95A8] hover:text-[#A3AEC0] hover:bg-white/[0.03]"
                )}
                style={active ? { background: "hsl(176 50% 15%)", color: "hsl(176 65% 55%)" } : {}}
              >
                <Icon size={15} strokeWidth={active ? 2 : 1.5} className={active ? "" : "text-[#8B95A8]"} style={active ? { color: "hsl(176 65% 55%)" } : {}} />
                {label}
                {label === "Live Feed" && <span className="ml-auto pulse-dot" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 pb-5 pt-3">
        <div className="h-px mb-3" style={{ background: "hsl(220 25% 16%)" }} />
        <div className="text-[9px] text-[#8B95A8] leading-relaxed space-y-1">
          <div>SPD Open Data · SPD Blotter · Cascade PBS · KOMO · KIRO 7 · Fox 13 · King Co. Prosecutors</div>
          <div>2024–Present · Seattle Metro</div>
          <div className="mt-2" style={{ color: "hsl(176 55% 45%)" }}>bullecloud.com</div>
        </div>
      </div>
    </aside>
  );
}
