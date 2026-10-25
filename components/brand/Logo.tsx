import { LOGO_PATH, LOGO_VIEWBOX } from "./logo-path";

/** The SNOOZ wordmark, traced from the original business card. Inherits text colour. */
export function Logo({ className, title = "SNOOZ" }: { className?: string; title?: string }) {
  return (
    <svg viewBox={LOGO_VIEWBOX} className={className} role="img" aria-label={title} fill="currentColor">
      <path d={LOGO_PATH} />
    </svg>
  );
}
