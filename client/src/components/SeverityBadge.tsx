import { cn } from "@/lib/utils";

const BADGE_CLS: Record<string, string> = {
  fatal: "badge-fatal", injury: "badge-injury", robbery: "badge-robbery",
  assault: "badge-assault", policy: "badge-other", other: "badge-other",
};
const LABELS: Record<string, string> = {
  fatal: "Fatal", injury: "Injury", robbery: "Robbery", assault: "Assault", policy: "Policy", other: "Other",
};

export function SeverityBadge({ severity }: { severity: string }) {
  const s = (severity?.toLowerCase() ?? "other");
  return (
    <span className={cn("font-medium px-1.5 py-px rounded inline-block", BADGE_CLS[s] ?? "badge-other")}>
      {LABELS[s] ?? severity}
    </span>
  );
}

const STATUS_CLS: Record<string, string> = {
  resolved: "status-resolved",
  "under investigation": "status-under-investigation",
  active: "status-active",
};

export function StatusBadge({ status }: { status: string }) {
  const k = status?.toLowerCase() ?? "active";
  return (
    <span className={cn("font-normal px-1.5 py-px rounded inline-block text-[9px] capitalize", STATUS_CLS[k] ?? "status-active")}>
      {status}
    </span>
  );
}
