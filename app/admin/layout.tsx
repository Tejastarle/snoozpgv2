import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | SNOOZ Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="on-light min-h-screen bg-[#f5f3f0] text-charcoal [color-scheme:light]">{children}</div>;
}
