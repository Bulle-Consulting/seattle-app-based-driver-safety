import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { Bell, CheckCircle2, Loader2, Users } from "lucide-react";

const ACCENT = "#FFFFFF";

const NEIGHBORHOODS = [
  "Rainier Beach", "Capitol Hill", "SODO", "Belltown", "Pioneer Square",
  "University District", "Beacon Hill", "Georgetown", "Central District",
  "South Lake Union", "West Seattle", "Delridge", "Northgate",
  "Columbia City", "First Hill", "Downtown",
];

const INPUT_CLASS =
  "w-full bg-[#121212] border border-[#4D4D4D] rounded-md text-[12px] text-[#FFFFFF] px-3 py-2 focus:outline-none focus:border-[#C0C0C0] placeholder-[#8C8C8C] transition-colors";

export default function AlertsPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: existingAlerts = [] } = useQuery<any[]>({
    queryKey: ["/api/alerts"],
    queryFn: () => apiRequest("GET", "/api/alerts").then(r => r.json()),
  });

  const subscriberCount = existingAlerts.length;

  const toggleNeighborhood = (n: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n); else next.add(n);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === NEIGHBORHOODS.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(NEIGHBORHOODS));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email && !phone) { setError("Please enter at least an email or phone number."); return; }
    if (selected.size === 0) { setError("Please select at least one neighborhood."); return; }
    setLoading(true);
    setError(null);
    try {
      await apiRequest("POST", "/api/alerts", {
        email: email || undefined,
        phone: phone || undefined,
        neighborhoods: JSON.stringify(Array.from(selected)),
      });
      setSuccess(true);
      setEmail("");
      setPhone("");
      setSelected(new Set());
    } catch (err: any) {
      setError(err?.message ?? "Subscription failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Alerts" subtitle="Get notified about safety incidents in your area">
        <main className="flex-1 p-3 md:p-5">
          <div className="max-w-2xl space-y-5">

            {/* Subscriber count */}
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-md border border-[#4D4D4D] bg-[#262626]/20">
              <Users size={14} style={{ color: ACCENT }} />
              <span className="text-[11px] text-[#D9D9D9]">
                <span className="tabular-nums font-semibold text-[#FFFFFF]">{subscriberCount}</span> current subscriber{subscriberCount !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Success */}
            {success && (
              <div
                data-testid="alerts-success"
                className="flex items-start gap-3 p-4 rounded-md border"
                style={{ background: "#1F1F1F", borderColor: "#4D4D4D" }}
              >
                <CheckCircle2 size={18} style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                <div>
                  <div className="text-[12px] font-semibold text-[#FFFFFF] mb-0.5">You're subscribed!</div>
                  <div className="text-[11px] text-[#D9D9D9] leading-relaxed">
                    You'll receive alerts for incidents in your selected areas.
                  </div>
                  <button
                    onClick={() => setSuccess(false)}
                    className="mt-2 text-[10px] font-medium hover:opacity-80 transition-opacity"
                    style={{ color: ACCENT }}
                  >
                    Subscribe another address
                  </button>
                </div>
              </div>
            )}

            {/* Form */}
            {!success && (
              <form onSubmit={handleSubmit} className="bg-[#121212] border border-[#4D4D4D] rounded-md p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Bell size={14} style={{ color: ACCENT }} />
                  <div className="text-[11px] font-semibold text-[#FFFFFF]">Alert Subscription</div>
                </div>

                {/* Contact */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="section-label block mb-1">Email Address</label>
                    <input
                      data-testid="alerts-email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className="section-label block mb-1">Phone Number (optional)</label>
                    <input
                      data-testid="alerts-phone"
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="206-555-0100"
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                {/* Neighborhoods */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="section-label">Neighborhoods to Monitor</label>
                    <button
                      type="button"
                      data-testid="alerts-select-all"
                      onClick={selectAll}
                      className="text-[10px] font-medium hover:opacity-80 transition-opacity"
                      style={{ color: ACCENT }}
                    >
                      {selected.size === NEIGHBORHOODS.length ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 p-3 rounded-md bg-[#121212] border border-[#4D4D4D]">
                    {NEIGHBORHOODS.map(n => {
                      const checked = selected.has(n);
                      return (
                        <button
                          key={n}
                          type="button"
                          data-testid={`alerts-nb-${n.toLowerCase().replace(/\s+/g, "-")}`}
                          onClick={() => toggleNeighborhood(n)}
                          className="flex items-center gap-1.5 px-2 py-1.5 rounded text-left text-[10px] transition-all"
                          style={checked
                            ? { background: "#262626", color: ACCENT }
                            : { color: "#D9D9D9" }}
                        >
                          <span
                            className="w-3 h-3 rounded border shrink-0 flex items-center justify-center"
                            style={{ borderColor: checked ? ACCENT : "#4D4D4D", background: checked ? ACCENT : "transparent" }}
                          >
                            {checked && (
                              <svg width="7" height="5" viewBox="0 0 7 5" fill="none">
                                <path d="M1 2.5L2.8 4.2L6 1" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </span>
                          {n}
                        </button>
                      );
                    })}
                  </div>
                  {selected.size > 0 && (
                    <div className="text-[9px] text-[#A6A6A6] mt-1">{selected.size} neighborhood{selected.size > 1 ? "s" : ""} selected</div>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <div className="text-[11px] text-[#FFFFFF] px-3 py-2 rounded border"
                    style={{ background: "#1F1F1F", borderColor: "#4D4D4D" }}>
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  data-testid="alerts-subscribe"
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-md text-[12px] font-semibold text-[#000000] transition-opacity hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: ACCENT }}
                >
                  {loading && <Loader2 size={13} className="animate-spin" />}
                  {loading ? "Subscribing..." : "Subscribe to Alerts"}
                </button>
              </form>
            )}

            {/* Privacy note */}
            <div className="px-4 py-3 rounded-md border border-[#4D4D4D] bg-[#121212]">
              <div className="text-[10px] text-[#A6A6A6] leading-relaxed">
                Alert notifications are sent when new verified incidents are added to the database. We do not share your information with third parties or platforms.
              </div>
            </div>

          </div>

          <div className="text-[9px] text-[#A6A6A6] mt-5 pb-2">
            bullecloud.com · Alerts are sent for verified incidents only.
          </div>
        </main>
    </Layout>
  );
}
