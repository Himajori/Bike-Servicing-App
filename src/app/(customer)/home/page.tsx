"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bike, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/pricing";
import { STATUS_LABELS } from "@/lib/booking-flow";
import type { SessionUser } from "@/lib/auth";

type BookingRow = {
  id: string;
  status: keyof typeof STATUS_LABELS;
  estimatedPrice: number;
  scheduledAt: string;
  mode: "DOORSTEP" | "PICKUP_DROP";
  service: { name: string };
  bike: { brand: string; model: string };
};

export default function HomePage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [bikes, setBikes] = useState<number>(0);
  const [active, setActive] = useState<BookingRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([
      api<{ user: SessionUser }>("/api/auth/me"),
      api<{ bikes: unknown[] }>("/api/bikes"),
      api<{ bookings: BookingRow[] }>("/api/bookings"),
    ])
      .then(([me, bikeData, bookingData]) => {
        if (!alive) return;
        setUser(me.user);
        setBikes(bikeData.bikes.length);
        const open = bookingData.bookings.find(
          (b) => !["COMPLETED", "CANCELLED"].includes(b.status),
        );
        setActive(open ?? null);
      })
      .catch((err) => {
        if (alive) setError(err instanceof Error ? err.message : "Could not load home.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className="px-5 pb-6 pt-8">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Good ride</p>
      <h1 className="font-heading mt-1 text-3xl">
        {loading ? "Loading…" : `Hi, ${user?.name.split(" ")[0] ?? "there"}`}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">Austin service area · doorstep or pickup</p>

      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

      <section className="mt-6 rounded-3xl bg-[oklch(0.22_0.03_50)] p-5 text-[oklch(0.97_0.01_80)]">
        <p className="text-sm text-white/70">Next move</p>
        <h2 className="font-heading mt-1 text-2xl">Book a stand</h2>
        <p className="mt-2 text-sm text-white/70">
          Tune-ups, flats, e-bike diagnostics. You pick the hour; we bring the tools.
        </p>
        <Button render={<Link href="/services" />} className="mt-5" size="lg">
          View services <ArrowRight className="size-4" />
        </Button>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium">Active job</h2>
          <Link href="/bookings" className="text-sm text-primary">
            History
          </Link>
        </div>
        {loading ? (
          <div className="h-28 animate-pulse rounded-2xl bg-muted" />
        ) : active ? (
          <Link
            href={`/bookings/${active.id}`}
            className="block rounded-2xl border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{active.service.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {active.bike.brand} {active.bike.model}
                </p>
              </div>
              <Badge variant="secondary">{STATUS_LABELS[active.status]}</Badge>
            </div>
            <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock3 className="size-3.5" />
                {new Date(active.scheduledAt).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
              <span>{formatMoney(active.estimatedPrice)}</span>
            </div>
          </Link>
        ) : (
          <EmptyState
            title="No open jobs"
            body="When you book, status and the mechanic map live here."
            action={
              <Button render={<Link href="/services" />} variant="outline">
                Choose a service
              </Button>
            }
          />
        )}
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3">
        <Link href="/bikes" className="rounded-2xl border bg-card p-4">
          <Bike className="size-5 text-primary" />
          <p className="mt-3 text-2xl font-semibold">{loading ? "—" : bikes}</p>
          <p className="text-sm text-muted-foreground">Bikes in the garage</p>
        </Link>
        <Link href="/bookings" className="rounded-2xl border bg-card p-4">
          <Clock3 className="size-5 text-primary" />
          <p className="mt-3 text-2xl font-semibold">Track</p>
          <p className="text-sm text-muted-foreground">Payments & reviews</p>
        </Link>
      </section>
    </main>
  );
}
