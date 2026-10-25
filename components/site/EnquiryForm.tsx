"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { ACCOMMODATION_PREFERENCES } from "@/lib/defaults";
import { getUtm, track } from "@/lib/analytics";
import { whatsappHref } from "@/lib/contact";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/brand/SocialIcons";
import { useSite } from "./SiteShell";

type Errors = Partial<Record<string, string>>;

/** Local calendar date (YYYY-MM-DD) in the visitor's timezone. */
const today = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

function validate(v: Record<string, string>): Errors {
  const e: Errors = {};
  if (!v.full_name || v.full_name.trim().length < 2) e.full_name = "Enter your full name";
  const phone = (v.phone || "").replace(/[^\d+]/g, "");
  if (!/^(\+?91)?[6-9]\d{9}$|^\+?\d{10,15}$/.test(phone)) e.phone = "Enter a valid mobile number";
  if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email)) e.email = "Enter a valid email address";
  if (v.check_in && v.check_in < today()) e.check_in = "Pick today or a later date";
  if (v.check_in && v.check_out && v.check_out < v.check_in) e.check_out = "Check-out must be after check-in";
  return e;
}

export function EnquiryForm({
  source = "enquiry-section",
  after = "inline",
  compact = false,
  onDone,
}: {
  source?: string;
  after?: "inline" | "redirect";
  compact?: boolean;
  onDone?: () => void;
}) {
  const { site, content } = useSite();
  const router = useRouter();
  const startedAt = useRef<number>(0);
  const [values, setValues] = useState<Record<string, string>>({ guests: "1", preference: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [serverError, setServerError] = useState("");
  const [touchedStart, setTouchedStart] = useState(false);
  // Computed after mount so statically cached HTML never carries a stale "today".
  const [minDate, setMinDate] = useState<string | undefined>(undefined);

  useEffect(() => {
    startedAt.current = Date.now();
    setMinDate(today());
  }, []);

  const set = (k: string) => (e: { target: { value: string } }) => {
    if (!touchedStart) {
      setTouchedStart(true);
      track("form_start", { source });
    }
    setValues((s) => ({ ...s, [k]: e.target.value }));
    if (errors[k]) setErrors((s) => ({ ...s, [k]: undefined }));
  };

  const minOut = useMemo(() => values.check_in || minDate, [values.check_in, minDate]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const v: Record<string, string> = { ...values, company: String(form.get("company") ?? "") };
    const errs = validate(v);
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0];
      document.getElementById(`${source}-${first}`)?.focus();
      return;
    }
    setStatus("sending");
    setServerError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...v,
          guests: v.guests ? Number(v.guests) : null,
          source,
          page: window.location.pathname,
          utm: getUtm(),
          started_at: startedAt.current,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        if (json.fieldErrors) setErrors(json.fieldErrors);
        setServerError(json.error || "We couldn't send your enquiry. Please try again or call us.");
        setStatus("error");
        return;
      }
      track("generate_lead", { source, preference: v.preference || "unspecified", guests: v.guests });
      track("form_submit", { source });
      setStatus("done");
      if (after === "redirect") router.push("/thank-you");
    } catch {
      setServerError("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  const fieldId = (k: string) => `${source}-${k}`;
  const err = (k: string) =>
    errors[k] ? (
      <p id={`${fieldId(k)}-err`} className="mt-1.5 text-[0.82rem] font-medium text-[#a32a19]">
        {errors[k]}
      </p>
    ) : null;
  const aria = (k: string) => ({
    id: fieldId(k),
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `${fieldId(k)}-err` : undefined,
  });

  return (
    <div className="on-light relative text-charcoal">
      <AnimatePresence mode="wait" initial={false}>
        {status === "done" && after === "inline" ? (
          <SuccessState key="done" message={content.enquiry_success} waHref={whatsappHref(site)} onDone={onDone} />
        ) : (
          <motion.form
            key="form"
            onSubmit={submit}
            noValidate
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {/* Honeypot (hidden from people, tempting for bots) */}
            <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden>
              <label>
                Company
                <input type="text" name="company" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className="field-label" htmlFor={fieldId("full_name")}>Full name</label>
              <input className="field" autoComplete="name" value={values.full_name ?? ""} onChange={set("full_name")} {...aria("full_name")} required />
              {err("full_name")}
            </div>
            <div>
              <label className="field-label" htmlFor={fieldId("phone")}>Mobile number</label>
              <input className="field" type="tel" inputMode="tel" autoComplete="tel" placeholder="98xxx xxxxx" value={values.phone ?? ""} onChange={set("phone")} {...aria("phone")} required />
              {err("phone")}
            </div>
            <div>
              <label className="field-label" htmlFor={fieldId("email")}>
                Email <span className="font-normal text-charcoal/50">(optional)</span>
              </label>
              <input className="field" type="email" autoComplete="email" value={values.email ?? ""} onChange={set("email")} {...aria("email")} />
              {err("email")}
            </div>
            <div>
              <label className="field-label" htmlFor={fieldId("check_in")}>Check-in</label>
              <input className="field" type="date" min={minDate} value={values.check_in ?? ""} onChange={set("check_in")} {...aria("check_in")} />
              {err("check_in")}
            </div>
            <div>
              <label className="field-label" htmlFor={fieldId("check_out")}>Check-out</label>
              <input className="field" type="date" min={minOut} value={values.check_out ?? ""} onChange={set("check_out")} {...aria("check_out")} />
              {err("check_out")}
            </div>
            <div>
              <label className="field-label" htmlFor={fieldId("guests")}>Guests</label>
              <select className="field" value={values.guests} onChange={set("guests")} {...aria("guests")}>
                {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                  <option key={n} value={n}>
                    {n === 10 ? "10+" : n} {n === 1 ? "guest" : "guests"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor={fieldId("preference")}>Stay type</label>
              <select className="field" value={values.preference} onChange={set("preference")} {...aria("preference")}>
                <option value="">Choose one</option>
                {ACCOMMODATION_PREFERENCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            {!compact && (
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor={fieldId("message")}>
                  Message <span className="font-normal text-charcoal/50">(optional)</span>
                </label>
                <textarea className="field" rows={3} placeholder="Arrival time, upper or lower berth, length of stay…" value={values.message ?? ""} onChange={set("message")} {...aria("message")} />
              </div>
            )}

            {serverError && (
              <p role="alert" className="rounded-xl bg-[#a32a19]/8 px-4 py-3 text-sm font-medium text-[#8a2414] sm:col-span-2">
                {serverError}
              </p>
            )}

            <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={status === "sending"}
                className={cn("btn btn-maroon w-full sm:w-auto sm:min-w-[15rem]", status === "sending" && "opacity-80")}
                data-cursor="hover"
              >
                {status === "sending" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Sending
                  </>
                ) : (
                  content.cta_primary
                )}
              </button>
              <p className="text-[0.82rem] leading-snug text-charcoal/55">
                We reply within working hours. No spam — your details are only used for your stay.
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function SuccessState({ message, waHref, onDone }: { message: string; waHref: string; onDone?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center py-8 text-center"
      role="status"
      aria-live="polite"
    >
      <SuccessMark />
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="mt-6 max-w-sm text-2xl font-bold leading-tight tracking-tight [font-variation-settings:'wdth'_108]"
      >
        {message}
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="mt-6 flex flex-col items-center gap-3 sm:flex-row"
      >
        <a href={waHref} target="_blank" rel="noopener" className="btn btn-ghost-dark btn-sm" data-track="whatsapp_click" data-track-location="enquiry-success">
          <WhatsAppIcon className="h-4 w-4" /> Need it faster? WhatsApp us
        </a>
        {onDone && (
          <button type="button" onClick={onDone} className="btn btn-sm text-charcoal/70 hover:text-charcoal">
            Close
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

/** A capsule outline draws itself, then a check settles inside it. */
export function SuccessMark({ light = false }: { light?: boolean }) {
  const stroke = light ? "#F4EFE8" : "#67231A";
  return (
    <svg width="148" height="84" viewBox="0 0 148 84" fill="none" aria-hidden>
      <motion.rect
        x="3" y="3" width="142" height="78" rx="39"
        stroke={stroke} strokeWidth="2.5"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }}
      />
      <motion.path
        d="M56 43.5 L68.5 56 L93 30"
        stroke={stroke} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.55, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}
