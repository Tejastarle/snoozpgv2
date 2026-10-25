import type { Metadata } from "next";
import Link from "next/link";
import { ThankYouMark } from "@/components/site/ThankYou";
import { getSiteContent } from "@/lib/content";
import { whatsappHref } from "@/lib/contact";
import { WhatsAppIcon } from "@/components/brand/SocialIcons";

export const metadata: Metadata = {
  title: "Enquiry received",
  robots: { index: false, follow: false },
  alternates: { canonical: "/thank-you" },
};

export default async function ThankYouPage() {
  const { site, content } = await getSiteContent();
  return (
    <section className="relative flex min-h-[90svh] items-center bg-[radial-gradient(ellipse_at_50%_20%,#1d4e6b_0%,#0c2230_45%,#16181b_85%)] pb-24 pt-40">
      <div className="container-x flex flex-col items-center text-center">
        <ThankYouMark />
        <h1 className="display display-l mt-10 max-w-[16ch] text-linen">{content.enquiry_success}</h1>
        <p className="lede mx-auto mt-6 text-linen/70">
          We&apos;ve got your enquiry. If you need an answer right away, WhatsApp us and mention your name.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a href={whatsappHref(site)} target="_blank" rel="noopener" className="btn btn-light" data-track="whatsapp_click" data-track-location="thank-you">
            <WhatsAppIcon className="h-4 w-4" /> WhatsApp us
          </a>
          <Link href="/" className="btn btn-ghost">Back to SNOOZ</Link>
        </div>
      </div>
    </section>
  );
}
