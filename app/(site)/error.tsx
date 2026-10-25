"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="flex min-h-[80svh] items-center bg-charcoal pt-32">
      <div className="container-x text-center">
        <h1 className="display display-m text-linen">Something went wrong loading this page.</h1>
        <p className="mx-auto mt-5 max-w-md text-linen/65">Try again in a moment. If it keeps happening, call or WhatsApp us — we&apos;re open 24/7.</p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="btn btn-light">Try again</button>
          <Link href="/" className="btn btn-ghost">Back to home</Link>
        </div>
      </div>
    </section>
  );
}
