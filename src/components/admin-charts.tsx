"use client";

import { useMemo, useState } from "react";

const BUCKETS = [
  { key: "completed", label: "Completed", color: "#16a34a", match: ["COMPLETED"] },
  {
    key: "ongoing",
    label: "Ongoing",
    color: "#d97706",
    match: ["EN_ROUTE", "IN_PROGRESS", "MECHANIC_ASSIGNED", "READY"],
  },
  { key: "pending", label: "Pending", color: "#2563eb", match: ["REQUESTED", "CONFIRMED"] },
  { key: "cancelled", label: "Cancelled", color: "#9ca3af", match: ["CANCELLED"] },
] as const;

export function StatusDonut({ byStatus }: { byStatus: Record<string, number> }) {
  const [hover, setHover] = useState<string | null>(null);
  const slices = useMemo(() => {
    const counts = BUCKETS.map((bucket) => ({
      ...bucket,
      value: bucket.match.reduce((sum, status) => sum + (byStatus[status] ?? 0), 0),
    }));
    const total = counts.reduce((sum, slice) => sum + slice.value, 0) || 1;
    let angle = -90;
    return counts.map((slice) => {
      const deg = (slice.value / total) * 360;
      const start = angle;
      angle += deg;
      return { ...slice, pct: Math.round((slice.value / total) * 100), start, deg };
    });
  }, [byStatus]);

  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const active = slices.find((s) => s.key === hover) ?? null;
  const gradient = slices
    .map((slice) => `${slice.color} ${slice.start + 90}deg ${slice.start + 90 + slice.deg}deg`)
    .join(", ");

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <button
        type="button"
        className="relative size-44 shrink-0 rounded-full"
        style={{ background: `conic-gradient(${gradient})` }}
        aria-label="Bookings by status"
      >
        <span className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-card text-center">
          <span className="text-2xl font-semibold">{active ? `${active.pct}%` : total}</span>
          <span className="text-xs text-muted-foreground">{active?.label ?? "Jobs"}</span>
        </span>
      </button>
      <ul className="w-full space-y-2 text-sm">
        {slices.map((slice) => (
          <li key={slice.key}>
            <button
              type="button"
              onMouseEnter={() => setHover(slice.key)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(slice.key)}
              onBlur={() => setHover(null)}
              className="flex w-full items-center justify-between rounded-xl px-2 py-1 hover:bg-muted"
            >
              <span className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ background: slice.color }} />
                {slice.label}
              </span>
              <span>
                {slice.value} · {slice.pct}%
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BookingsTrend({
  days: input,
}: {
  days: { day: string; count: number }[];
}) {
  const days = input.length ? input : [{ day: new Date().toISOString().slice(0, 10), count: 0 }];
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...days.map((d) => d.count));
  const width = 320;
  const height = 140;
  const pad = 16;
  const points = days.map((d, i) => {
    const x = pad + (i / Math.max(1, days.length - 1)) * (width - pad * 2);
    const y = height - pad - (d.count / max) * (height - pad * 2);
    return { ...d, x, y };
  });
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${path} L ${points.at(-1)?.x ?? pad} ${height - pad} L ${pad} ${height - pad} Z`;
  const active = hover !== null ? points[hover] : null;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full">
        <path d={area} fill="oklch(0.7 0.155 58 / 0.18)" />
        <path d={path} fill="none" stroke="oklch(0.7 0.155 58)" strokeWidth="2.5" />
        {points.map((point, index) => (
          <g key={point.day}>
            <circle
              cx={point.x}
              cy={point.y}
              r={hover === index ? 6 : 4}
              fill="oklch(0.7 0.155 58)"
              className="cursor-pointer"
              onMouseEnter={() => setHover(index)}
              onMouseLeave={() => setHover(null)}
            />
          </g>
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        {days.map((d) => (
          <span key={d.day}>{d.day.slice(5)}</span>
        ))}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {active
          ? `${active.day}: ${active.count} booking${active.count === 1 ? "" : "s"}`
          : "Hover a point for that day’s volume."}
      </p>
    </div>
  );
}

export function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </article>
  );
}
