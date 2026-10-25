"use client";

import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { AlertTriangle, CheckCircle2, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Buttons ─────────────────────────────────────────────── */
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger"; size?: "sm" | "md"; loading?: boolean };
export function Button({ variant = "primary", size = "md", loading, className, children, disabled, ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-55",
        size === "sm" ? "h-9 px-3 text-[0.82rem]" : "h-11 px-4 text-sm",
        variant === "primary" && "bg-maroon text-linen hover:bg-maroon-600",
        variant === "secondary" && "border border-charcoal/12 bg-white text-charcoal hover:border-charcoal/25 hover:bg-charcoal/[0.02]",
        variant === "ghost" && "text-charcoal/70 hover:bg-charcoal/5 hover:text-charcoal",
        variant === "danger" && "bg-[#b4321f] text-white hover:bg-[#9a2a19]",
        className,
      )}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

/* ─── Form controls ───────────────────────────────────────── */
const control = "w-full rounded-xl border border-charcoal/12 bg-white px-3.5 text-[0.92rem] text-charcoal placeholder:text-charcoal/35 transition focus:border-maroon focus:outline-none focus:ring-4 focus:ring-maroon/10";
export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(control, "h-11", props.className)} />;
}
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(control, "min-h-[96px] py-2.5 leading-relaxed", props.className)} />;
}
export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(control, "h-11 pr-8", props.className)} />;
}
export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[0.8rem] font-semibold text-charcoal/75">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-charcoal/45">{hint}</span>}
    </label>
  );
}
export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn("relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors", checked ? "bg-maroon" : "bg-charcoal/20")}
    >
      <span className={cn("inline-block h-5 w-5 rounded-full bg-white shadow transition-transform", checked ? "translate-x-[22px]" : "translate-x-0.5")} />
    </button>
  );
}

/* ─── Surfaces ────────────────────────────────────────────── */
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-charcoal/[0.07] bg-white", className)}>{children}</div>;
}
export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 className="text-[1.65rem] font-extrabold tracking-tight text-charcoal [font-variation-settings:'wdth'_106]">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-[0.92rem] text-charcoal/55">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <svg width="74" height="42" viewBox="0 0 148 84" fill="none" aria-hidden>
        <rect x="3" y="3" width="142" height="78" rx="39" stroke="#67231a" strokeOpacity="0.35" strokeWidth="3" strokeDasharray="8 8" />
      </svg>
      <p className="mt-5 font-semibold text-charcoal">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-charcoal/55">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export const STATUS_STYLE: Record<string, string> = {
  new: "bg-[#e7f0f7] text-[#1d4e6b]",
  contacted: "bg-[#fbf0dc] text-[#8a5a10]",
  interested: "bg-[#efe7f6] text-[#5b3a86]",
  booked: "bg-[#e3f2e8] text-[#1f6b3a]",
  closed: "bg-charcoal/[0.06] text-charcoal/60",
  published: "bg-[#e3f2e8] text-[#1f6b3a]",
  draft: "bg-charcoal/[0.06] text-charcoal/60",
};
export function Badge({ children, tone }: { children: ReactNode; tone: string }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", STATUS_STYLE[tone] ?? STATUS_STYLE.closed)}>{children}</span>;
}

/* ─── Drawer ──────────────────────────────────────────────── */
export function Drawer({ open, onClose, title, children, footer, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const on = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", on);
    return () => document.removeEventListener("keydown", on);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div className="absolute inset-0 bg-charcoal/40 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className={cn("absolute inset-y-0 right-0 flex w-full flex-col bg-[#fbfaf8] shadow-2xl", wide ? "max-w-3xl" : "max-w-xl")}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 34 }}
          >
            <div className="flex items-center justify-between border-b border-charcoal/[0.07] px-6 py-4">
              <h2 className="text-lg font-bold text-charcoal">{title}</h2>
              <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg text-charcoal/60 hover:bg-charcoal/5" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
            {footer && <div className="flex items-center justify-end gap-2 border-t border-charcoal/[0.07] bg-white px-6 py-4">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ─── Confirm ─────────────────────────────────────────────── */
export function Confirm({ open, title, text, confirmLabel = "Delete", onConfirm, onCancel, busy }: { open: boolean; title: string; text?: string; confirmLabel?: string; onConfirm: () => void; onCancel: () => void; busy?: boolean }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] grid place-items-center p-4" role="alertdialog" aria-modal="true" aria-label={title}>
          <motion.div className="absolute inset-0 bg-charcoal/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} />
          <motion.div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#b4321f]/10 text-[#b4321f]">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-charcoal">{title}</h3>
            {text && <p className="mt-1 text-sm text-charcoal/60">{text}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={onCancel}>Cancel</Button>
              <Button variant="danger" onClick={onConfirm} loading={busy}>{confirmLabel}</Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ─── Toasts ──────────────────────────────────────────────── */
type Toast = { id: number; text: string; tone: "ok" | "error" };
const ToastCtx = createContext<(text: string, tone?: "ok" | "error") => void>(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, tone: "ok" | "error" = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[70] flex flex-col gap-2" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              className={cn("pointer-events-auto flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium shadow-xl", t.tone === "ok" ? "bg-charcoal text-linen" : "bg-[#b4321f] text-white")}
            >
              {t.tone === "ok" ? <CheckCircle2 className="h-4 w-4 text-[#7fd1a0]" /> : <AlertTriangle className="h-4 w-4" />}
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
