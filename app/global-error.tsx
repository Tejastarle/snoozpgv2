"use client";
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en-IN">
      <body style={{ background: "#16181b", color: "#f4efe8", fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0, textAlign: "center", padding: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 12 }}>SNOOZ is having a moment.</h1>
          <p style={{ opacity: 0.7, marginBottom: 24 }}>Please refresh, or call us on +91 88501 19077.</p>
          <button onClick={reset} style={{ background: "#f4efe8", color: "#67231a", border: 0, borderRadius: 999, padding: "14px 24px", fontWeight: 700, cursor: "pointer" }}>Try again</button>
        </div>
      </body>
    </html>
  );
}
