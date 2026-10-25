import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";
import { isDemoMode, isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-charcoal lg:block">
        <video className="absolute inset-0 h-full w-full object-cover opacity-50" autoPlay muted loop playsInline poster="/media/img/hero-poster.jpg">
          <source src="/media/video/hero-room.webm" type="video/webm" />
          <source src="/media/video/hero-room.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-linen">
          <p className="display text-5xl leading-[0.9]">Every enquiry,</p>
          <p className="sea text-6xl">in one place.</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-6 py-16">
        <Suspense>
          <LoginForm configured={isSupabaseConfigured} demo={isDemoMode} />
        </Suspense>
      </div>
    </main>
  );
}
