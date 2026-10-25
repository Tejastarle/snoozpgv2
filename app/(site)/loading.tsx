export default function Loading() {
  return (
    <div className="flex min-h-[80svh] items-center justify-center bg-charcoal" role="status" aria-label="Loading">
      <svg width="96" height="54" viewBox="0 0 148 84" fill="none" aria-hidden className="animate-pulse">
        <rect x="3" y="3" width="142" height="78" rx="39" stroke="#f4efe8" strokeOpacity="0.5" strokeWidth="2.5" />
      </svg>
    </div>
  );
}
