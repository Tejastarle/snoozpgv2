import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_30%,#1d4e6b_0%,#0c2230_45%,#16181b_85%)] px-4 text-center">
      <Link href="/" aria-label="SNOOZ home" className="absolute left-1/2 top-8 -translate-x-1/2 text-linen">
        <Logo className="h-7 w-auto" />
      </Link>
      <p className="display text-[clamp(7rem,26vw,20rem)] leading-none text-linen/10" aria-hidden>404</p>
      <h1 className="-mt-6 text-linen md:-mt-12">
        <span className="display display-m block">This berth is empty.</span>
        <span className="sea mt-2 block text-[clamp(2rem,5vw,3.6rem)]">The page drifted out to sea.</span>
      </h1>
      <p className="mt-6 max-w-md text-linen/65">The link may be old or mistyped. Head back home or check availability for your stay.</p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="btn btn-light">Back to SNOOZ</Link>
        <Link href="/contact" className="btn btn-ghost">Contact us</Link>
      </div>
    </main>
  );
}
