"use client";

import { useMemo, useRef, useState } from "react";

/**
 * Small, dependency-free SVG charts for the dashboard.
 * Single-series charts use one hue (brand maroon); text stays in ink tokens.
 * Every chart has a hover tooltip and an accessible table fallback.
 */

const INK = "#16181b";
const MUTED = "rgba(22,24,27,0.5)";
const GRID = "rgba(22,24,27,0.08)";
const SERIES = "#67231a";

type Datum = { label: string; value: number; hint?: string };

function niceMax(v: number) {
  if (v <= 4) return 4;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}

function SrTable({ caption, data, unit }: { caption: string; data: Datum[]; unit: string }) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th>Period</th>
          <th>{unit}</th>
        </tr>
      </thead>
      <tbody>
        {data.map((d) => (
          <tr key={d.label}>
            <td>{d.hint ?? d.label}</td>
            <td>{d.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Line + soft area, with a crosshair tooltip. */
export function LineChart({ data, caption, unit = "Leads", height = 220 }: { data: Datum[]; caption: string; unit?: string; height?: number }) {
  const W = 640, H = height, L = 32, R = 12, T = 14, B = 26;
  const max = niceMax(Math.max(1, ...data.map((d) => d.value)));
  const x = (i: number) => L + (i * (W - L - R)) / Math.max(1, data.length - 1);
  const y = (v: number) => T + (1 - v / max) * (H - T - B);
  const [hover, setHover] = useState<number | null>(null);
  const svg = useRef<SVGSVGElement>(null);

  const path = useMemo(() => data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(" "), [data, max]); // eslint-disable-line react-hooks/exhaustive-deps
  const area = `${path} L${x(data.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;
  const ticks = [0, max / 2, max];

  const onMove = (e: React.PointerEvent) => {
    const r = svg.current!.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((px - L) / (W - L - R)) * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, i)));
  };

  return (
    <div className="relative">
      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={caption} onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="lc-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={SERIES} stopOpacity="0.16" />
            <stop offset="1" stopColor={SERIES} stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke={GRID} />
            <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill={MUTED}>{Math.round(t)}</text>
          </g>
        ))}
        {data.map((d, i) =>
          i % Math.ceil(data.length / 6) === 0 || i === data.length - 1 ? (
            <text key={i} x={x(i)} y={H - 6} textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"} fontSize="11" fill={MUTED}>{d.label}</text>
          ) : null,
        )}
        <path d={area} fill="url(#lc-fill)" />
        <path d={path} fill="none" stroke={SERIES} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={T} y2={y(0)} stroke={INK} strokeOpacity="0.25" strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(data[hover].value)} r="5" fill={SERIES} stroke="#fff" strokeWidth="2" />
          </g>
        )}
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg bg-charcoal px-2.5 py-1.5 text-xs text-linen shadow-lg"
          style={{ left: `${(x(hover) / W) * 100}%` }}
        >
          <span className="block text-linen/60">{data[hover].hint ?? data[hover].label}</span>
          <span className="font-semibold">{data[hover].value} {unit.toLowerCase()}</span>
        </div>
      )}
      <SrTable caption={caption} data={data} unit={unit} />
    </div>
  );
}

/** Vertical bars with 4px rounded data-ends and a 2px gap. */
export function BarChart({ data, caption, unit = "Bookings", height = 220 }: { data: Datum[]; caption: string; unit?: string; height?: number }) {
  const W = 640, H = height, L = 32, R = 8, T = 14, B = 26;
  const max = niceMax(Math.max(1, ...data.map((d) => d.value)));
  const slot = (W - L - R) / data.length;
  const bw = Math.min(34, slot - 2);
  const y = (v: number) => T + (1 - v / max) * (H - T - B);
  const [hover, setHover] = useState<number | null>(null);
  const ticks = [0, max / 2, max];
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={caption} onPointerLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke={GRID} />
            <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill={MUTED}>{Math.round(t)}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx = L + slot * i + slot / 2;
          const h = Math.max(0, y(0) - y(d.value));
          const r = Math.min(4, h / 2);
          const x0 = cx - bw / 2, y0 = y(d.value);
          return (
            <g key={d.label} onPointerEnter={() => setHover(i)}>
              <rect x={cx - slot / 2} y={T} width={slot} height={H - T - B} fill="transparent" />
              {h > 0 && (
                <path
                  d={`M${x0},${y(0)} V${y0 + r} Q${x0},${y0} ${x0 + r},${y0} H${x0 + bw - r} Q${x0 + bw},${y0} ${x0 + bw},${y0 + r} V${y(0)} Z`}
                  fill={SERIES}
                  fillOpacity={hover === null || hover === i ? 1 : 0.45}
                />
              )}
              {(i % Math.ceil(data.length / 6) === 0 || i === data.length - 1) && (
                <text x={cx} y={H - 6} textAnchor={i === data.length - 1 ? "end" : "middle"} fontSize="11" fill={MUTED}>{d.label}</text>
              )}
            </g>
          );
        })}
        <line x1={L} x2={W - R} y1={y(0)} y2={y(0)} stroke={INK} strokeOpacity="0.2" />
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg bg-charcoal px-2.5 py-1.5 text-xs text-linen shadow-lg"
          style={{ left: `${((L + slot * hover + slot / 2) / W) * 100}%` }}
        >
          <span className="block text-linen/60">{data[hover].hint ?? data[hover].label}</span>
          <span className="font-semibold">{data[hover].value} {unit.toLowerCase()}</span>
        </div>
      )}
      <SrTable caption={caption} data={data} unit={unit} />
    </div>
  );
}

/** Horizontal bars for category magnitude (e.g. enquiry sources). Labels are direct; no legend needed. */
export function HBarChart({ data, caption, unit = "Leads" }: { data: Datum[]; caption: string; unit?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <figure aria-label={caption}>
      <ul className="space-y-3">
        {data.map((d) => (
          <li key={d.label} className="group" title={`${d.label}: ${d.value} ${unit.toLowerCase()}`}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-[0.82rem]">
              <span className="truncate font-medium text-charcoal/80">{d.label}</span>
              <span className="shrink-0 tabular-nums text-charcoal/55">
                {d.value} <span className="text-charcoal/35">({Math.round((d.value / total) * 100)}%)</span>
              </span>
            </div>
            <div className="h-2 rounded-full bg-charcoal/[0.06]">
              <div className="h-2 rounded-full bg-maroon transition-[width] duration-700 group-hover:bg-maroon-600" style={{ width: `${(d.value / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
      <SrTable caption={caption} data={data} unit={unit} />
    </figure>
  );
}
