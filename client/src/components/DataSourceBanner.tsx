import { useEffect, useState } from "react";
import { AlertTriangle, Database } from "lucide-react";
import { getDataSource, subscribeDataSource, type DataSourceState } from "@/lib/staticData";

/**
 * Tells the user which data source is actually behind the numbers on screen.
 * Silence used to be the failure mode: with no backend the pages rendered
 * empty and looked merely uneventful.
 */
export default function DataSourceBanner() {
  const [state, setState] = useState<DataSourceState>(getDataSource);

  useEffect(() => subscribeDataSource(setState), []);

  if (state.mode === "api") return null;

  const unavailable = state.mode === "unavailable";

  // Tokens rather than literals so this renders correctly under both the current
  // palette and the Bulle Consulting black/white/silver one.
  return (
    <div
      role="alert"
      className="mx-3 md:mx-5 mt-3 flex items-start gap-2 rounded-md border px-3 py-2 text-[11px] leading-relaxed"
      style={{
        background: "hsl(var(--bg-raised))",
        borderColor: "hsl(var(--border-lite))",
        borderLeft: "3px solid hsl(var(--text-primary))",
        color: "hsl(var(--text-secondary))",
      }}
    >
      {unavailable ? (
        <AlertTriangle size={13} className="mt-0.5 flex-none" />
      ) : (
        <Database size={13} className="mt-0.5 flex-none" />
      )}
      <div>
        {unavailable ? (
          <>
            <span className="font-semibold">Incident data unavailable.</span> No backend is
            reachable and the static <code>incidents.json</code> could not be loaded, so this
            page has nothing to show. Regenerate it with <code>npm run generate:data</code> and
            redeploy — see DEPLOYMENT.md.
          </>
        ) : (
          <>
            <span className="font-semibold">Showing the curated static dataset.</span> No live
            backend is reachable, so figures come from the build-time snapshot
            {state.verifiedLabel ? ` (${state.verifiedLabel})` : ""}. Incident submissions,
            alert sign-ups, and the live SPD Blotter feed are unavailable until the backend is
            hosted — see DEPLOYMENT.md.
          </>
        )}
        {state.reason && (
          <div className="mt-0.5 opacity-70">
            <code>{state.reason}</code>
          </div>
        )}
      </div>
    </div>
  );
}
