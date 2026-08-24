"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/pricing";
import { STATUS_LABELS } from "@/lib/booking-flow";

type BookingRow = {
  id: string;
  status: keyof typeof STATUS_LABELS;
  estimatedPrice: number;
  scheduledAt: string;
  mode: "DOORSTEP" | "PICKUP_DROP";
  service: { name: string };
  bike: { brand: string; model: string };
  payment: { status: "UNPAID" | "PAID" | "REFUNDED" } | null;
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ bookings: BookingRow[] }>("/api/bookings")
      .then((data) => setBookings(data.bookings))
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load history."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="px-5 pb-8 pt-8">
      <h1 className="font-heading text-3xl">Service history</h1>
      <p className="mt-1 text-sm text-muted-foreground">Open jobs, payments, and past reviews.</p>
      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

      <div className="mt-5 space-y-3">
        {loading ? (
          <div className="h-28 animate-pulse rounded-2xl bg-muted" />
        ) : bookings.length === 0 ? (
          <EmptyState
            title="No bookings yet"
            body="Choose a service to put a bike on the stand."
            action={
              <Button render={<Link href="/services" />}>Browse services</Button>
            }
          />
        ) : (
          bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/bookings/${booking.id}`}
              className="block rounded-2xl border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-medium">{booking.service.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {booking.bike.brand} {booking.bike.model} ·{" "}
                    {booking.mode === "DOORSTEP" ? "Doorstep" : "Pickup & drop"}
                  </p>
                </div>
                <Badge variant={booking.status === "CANCELLED" ? "outline" : "secondary"}>
                  {STATUS_LABELS[booking.status]}
                </Badge>
              </div>
              <div className="mt-3 flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {new Date(booking.scheduledAt).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
                <span>
                  {formatMoney(booking.estimatedPrice)}
                  {booking.payment?.status === "UNPAID" ? " · due" : ""}
                  {booking.payment?.status === "PAID" ? " · paid" : ""}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
