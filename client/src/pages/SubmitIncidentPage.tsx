import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";

const ACCENT = "#FFFFFF";

const INCIDENT_TYPES = [
  "Robbery", "Assault", "Carjacking", "Shooting", "Stabbing",
  "Sexual Assault", "Other",
];

const PLATFORMS = ["Uber", "Lyft", "DoorDash", "Amazon Flex", "Other"];

interface FormData {
  date: string;
  type: string;
  neighborhood: string;
  address: string;
  platform: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
}

const EMPTY: FormData = {
  date: "",
  type: "Robbery",
  neighborhood: "",
  address: "",
  platform: "Uber",
  description: "",
  contactEmail: "",
  contactPhone: "",
};

const INPUT_CLASS =
  "w-full bg-[#121212] border border-[#4D4D4D] rounded-md text-[12px] text-[#FFFFFF] px-3 py-2 focus:outline-none focus:border-[#C0C0C0] placeholder-[#8C8C8C] transition-colors";

export default function SubmitIncidentPage() {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiRequest("POST", "/api/submissions", {
        date: form.date,
        type: form.type,
        neighborhood: form.neighborhood,
        address: form.address,
        platform: form.platform,
        description: form.description,
        contactEmail: form.contactEmail || undefined,
        contactPhone: form.contactPhone || undefined,
      });
      setSuccess(true);
      setForm(EMPTY);
    } catch (err: any) {
      setError(err?.message ?? "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Report an Incident" subtitle="Submit a safety incident for verification">
        <main className="flex-1 p-3 md:p-5">
          <div className="max-w-2xl space-y-5">

            {/* Success state */}
            {success && (
              <div
                data-testid="submit-success"
                className="flex items-start gap-3 p-4 rounded-md border"
                style={{ background: "#1F1F1F", borderColor: "#4D4D4D" }}
              >
                <CheckCircle2 size={18} style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                <div>
                  <div className="text-[12px] font-semibold text-[#FFFFFF] mb-0.5">Report submitted</div>
                  <div className="text-[11px] text-[#D9D9D9] leading-relaxed">
                    Thank you. Your report has been submitted for verification. Verified incidents will appear on the dashboard.
                  </div>
                  <button
                    onClick={() => setSuccess(false)}
                    className="mt-2 text-[10px] font-medium hover:opacity-80 transition-opacity"
                    style={{ color: ACCENT }}
                  >
                    Submit another report
                  </button>
                </div>
              </div>
            )}

            {/* Form */}
            {!success && (
              <form
                onSubmit={handleSubmit}
                className="bg-[#121212] border border-[#4D4D4D] rounded-md p-5 space-y-4"
              >
                <div className="text-[11px] font-semibold text-[#FFFFFF] mb-1">Incident Details</div>

                {/* Date + Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="section-label block mb-1">Date of Incident <span style={{ color: "#FFFFFF" }}>*</span></label>
                    <input
                      data-testid="submit-date"
                      type="date"
                      required
                      value={form.date}
                      onChange={set("date")}
                      className={INPUT_CLASS}
                      style={{ colorScheme: "dark" }}
                    />
                  </div>
                  <div>
                    <label className="section-label block mb-1">Type of Incident <span style={{ color: "#FFFFFF" }}>*</span></label>
                    <select
                      data-testid="submit-type"
                      required
                      value={form.type}
                      onChange={set("type")}
                      className={INPUT_CLASS}
                    >
                      {INCIDENT_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {/* Neighborhood + Address */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="section-label block mb-1">Neighborhood <span style={{ color: "#FFFFFF" }}>*</span></label>
                    <input
                      data-testid="submit-neighborhood"
                      type="text"
                      required
                      value={form.neighborhood}
                      onChange={set("neighborhood")}
                      placeholder="e.g. Rainier Beach"
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className="section-label block mb-1">Street Address or Intersection</label>
                    <input
                      data-testid="submit-address"
                      type="text"
                      value={form.address}
                      onChange={set("address")}
                      placeholder="e.g. MLK Jr Way & S Henderson"
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                {/* Platform */}
                <div>
                  <label className="section-label block mb-1">Platform <span style={{ color: "#FFFFFF" }}>*</span></label>
                  <select
                    data-testid="submit-platform"
                    required
                    value={form.platform}
                    onChange={set("platform")}
                    className={INPUT_CLASS}
                  >
                    {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="section-label block mb-1">Description <span style={{ color: "#FFFFFF" }}>*</span></label>
                  <textarea
                    data-testid="submit-description"
                    required
                    rows={3}
                    value={form.description}
                    onChange={set("description")}
                    placeholder="Briefly describe what happened..."
                    className={`${INPUT_CLASS} resize-none`}
                  />
                </div>

                {/* Contact (optional) */}
                <div className="border-t border-[#4D4D4D] pt-4">
                  <div className="text-[10px] text-[#A6A6A6] mb-3">Contact Information (optional — kept private)</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="section-label block mb-1">Your Email</label>
                      <input
                        data-testid="submit-email"
                        type="email"
                        value={form.contactEmail}
                        onChange={set("contactEmail")}
                        placeholder="optional"
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div>
                      <label className="section-label block mb-1">Your Phone</label>
                      <input
                        data-testid="submit-phone"
                        type="tel"
                        value={form.contactPhone}
                        onChange={set("contactPhone")}
                        placeholder="optional"
                        className={INPUT_CLASS}
                      />
                    </div>
                  </div>
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
                  data-testid="submit-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-md text-[12px] font-semibold text-[#000000] transition-opacity hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: ACCENT }}
                >
                  {loading && <Loader2 size={13} className="animate-spin" />}
                  {loading ? "Submitting..." : "Submit Report"}
                </button>
              </form>
            )}

            {/* Verification Process */}
            <div className="bg-[#121212] border border-[#4D4D4D] rounded-md p-5">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={14} style={{ color: ACCENT }} />
                <div className="text-[11px] font-semibold text-[#FFFFFF]">Verification Process</div>
              </div>
              <div className="space-y-2.5">
                {[
                  "All submissions are manually reviewed by our team before publication.",
                  "We cross-reference with SPD Blotter, King County Prosecutors, and local news sources.",
                  "Only verified incidents are added to the public database.",
                  "Your contact information is kept strictly private and never published.",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[11px] text-[#D9D9D9]">
                    <span className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center text-[9px] font-medium mt-0.5"
                      style={{ background: "#262626", color: ACCENT }}>
                      {i + 1}
                    </span>
                    {step}
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="text-[9px] text-[#A6A6A6] mt-5 pb-2">
            bullecloud.com · Incident data is verified before publication. We do not publish unverified reports.
          </div>
        </main>
    </Layout>
  );
}
