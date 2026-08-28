"use client";

import { FormEvent, use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ServiceMap } from "@/components/service-map";
import { StatusTimeline } from "@/components/status-timeline";
import { StarRating } from "@/components/star-rating";
import { EmptyState } from "@/components/empty-state";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/pricing";
import { nextStatus, STATUS_LABELS } from "@/lib/booking-flow";
import { CITY, type MapMarker } from "@/lib/maps";
import type { BookingStatus } from "@prisma/client";

type Booking = {
  id: string;
  status: BookingStatus;
  mode: "DOORSTEP" | "PICKUP_DROP";
  scheduledAt: string;
  address: string;
  lat: number | null;
  lng: number | null;
  estimatedPrice: number;
  notes: string | null;
  service: { name: string; durationMin: number };
  bike: { brand: string; model: string };
  mechanic: {
    id: string;
    specialty: string | null;
    rating: number;
    lat: number | null;
    lng: number | null;
    user: { name: string; phone: string | null };
  } | null;
  payment: { status: "UNPAID" | "PAID" | "REFUNDED"; method: string | null } | null;
  review: { rating: number; comment: string | null } | null;
  statusLogs: { id: string; status: BookingStatus; note: string | null; createdAt: string }[];
};

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<"card" | "upi" | "wallet">("card");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function refresh() {
    const data = await api<{ booking: Booking }>(`/api/bookings/${id}`);
    setBooking(data.booking);
  }

  useEffect(() => {
    let alive = true;
    api<{ booking: Booking }>(`/api/bookings/${id}`)
      .then((data) => {
        if (alive) setBooking(data.booking);
      })
      .catch((err) => {
        if (alive) setError(err instanceof Error ? err.message : "Could not load booking.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  const markers: MapMarker[] = useMemo(() => {
    if (!booking) return [];
    const list: MapMarker[] = [
      {
        id: "shop",
        lat: CITY.workshop.lat,
        lng: CITY.workshop.lng,
        label: "Workshop",
        kind: "workshop",
      },
    ];
    if (booking.lat && booking.lng) {
      list.push({ id: "you", lat: booking.lat, lng: booking.lng, label: "You", kind: "customer" });
    }
    if (booking.mechanic?.lat && booking.mechanic.lng) {
      list.push({
        id: "mech",
        lat: booking.mechanic.lat,
        lng: booking.mechanic.lng,
        label: booking.mechanic.user.name.split(" ")[0],
        kind: "mechanic",
      });
    }
    return list;
  }, [booking]);

  async function run(label: string, fn: () => Promise<void>) {
    setBusy(label);
    setError(null);
    try {
      await fn();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That action failed.");
    } finally {
      setBusy(null);
    }
  }

  async function pay(event: FormEvent) {
    event.preventDefault();
    await run("pay", async () => {
      await api(`/api/bookings/${id}/pay`, {
        method: "POST",
        body: JSON.stringify({ method }),
      });
    });
  }

  async function review(event: FormEvent) {
    event.preventDefault();
    await run("review", async () => {
      await api(`/api/bookings/${id}/review`, {
        method: "POST",
        body: JSON.stringify({ rating, comment }),
      });
    });
  }

  if (loading) {
    return (
      <main className="px-5 pt-8">
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="px-5 pt-8">
        <EmptyState title="Booking not found" body="It may belong to another account." />
      </main>
    );
  }

  const upcoming = nextStatus(booking.status, booking.mode);

  return (
    <main className="px-5 pb-10 pt-8">
      <Link href="/bookings" className="text-sm text-primary">
        All jobs
      </Link>
      <div className="mt-2 flex items-start justify-between gap-3">
        <h1 className="font-heading text-3xl">{booking.service.name}</h1>
        <Badge>{STATUS_LABELS[booking.status]}</Badge>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {booking.bike.brand} {booking.bike.model} ·{" "}
        {booking.mode === "DOORSTEP" ? "Doorstep" : "Pickup & drop"}
      </p>
      <p className="mt-1 text-sm">
        {new Date(booking.scheduledAt).toLocaleString()} · {formatMoney(booking.estimatedPrice)}
      </p>
      {booking.notes ? <p className="mt-2 text-sm text-muted-foreground">“{booking.notes}”</p> : null}

      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

      <section className="mt-5">
        <ServiceMap
          center={{ lat: booking.lat ?? CITY.center.lat, lng: booking.lng ?? CITY.center.lng }}
          markers={markers}
          selectedId={
            booking.status === "EN_ROUTE" && booking.mechanic
              ? "mech"
              : booking.lat
                ? "you"
                : "shop"
          }
          showLegend
          className="h-48"
        />
        <p className="mt-2 text-xs text-muted-foreground">{booking.address}</p>
      </section>

      {booking.mechanic ? (
        <section className="mt-5 rounded-2xl border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Mechanic</p>
          <h2 className="mt-1 font-medium">{booking.mechanic.user.name}</h2>
          <p className="text-sm text-muted-foreground">
            {booking.mechanic.specialty} · {booking.mechanic.rating.toFixed(1)}★
          </p>
        </section>
      ) : null}

      <section className="mt-6">
        <h2 className="font-medium">Track status</h2>
        <div className="mt-3">
          <StatusTimeline current={booking.status} logs={booking.statusLogs} />
        </div>
        {upcoming ? (
          <Button
            variant="outline"
            className="w-full"
            disabled={busy === "advance"}
            onClick={() =>
              void run("advance", async () => {
                const data = await api<{ booking: Booking }>(`/api/bookings/${id}/advance`, {
                  method: "POST",
                });
                setBooking(data.booking);
              })
            }
          >
            {busy === "advance" ? "Updating…" : `Simulate next: ${STATUS_LABELS[upcoming]}`}
          </Button>
        ) : null}
        {["REQUESTED", "CONFIRMED", "MECHANIC_ASSIGNED", "EN_ROUTE"].includes(booking.status) ? (
          <Button
            variant="ghost"
            className="mt-2 w-full text-destructive"
            disabled={busy === "cancel"}
            onClick={() =>
              void run("cancel", async () => {
                await api(`/api/bookings/${id}`, {
                  method: "PATCH",
                  body: JSON.stringify({ action: "cancel" }),
                });
              })
            }
          >
            Cancel booking
          </Button>
        ) : null}
      </section>

      <section className="mt-6 rounded-2xl border bg-card p-4">
        <h2 className="font-medium">Payment</h2>
        {booking.payment?.status === "PAID" ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Paid with {booking.payment.method}. Receipt is on this job.
          </p>
        ) : (
          <form onSubmit={pay} className="mt-3 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {(["card", "upi", "wallet"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMethod(item)}
                  className={`rounded-xl border py-2 text-sm capitalize ${
                    method === item ? "border-primary bg-accent" : ""
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <Button type="submit" className="w-full" disabled={busy === "pay"}>
              {busy === "pay" ? "Charging…" : `Pay ${formatMoney(booking.estimatedPrice)}`}
            </Button>
            <p className="text-xs text-muted-foreground">
              Demo checkout — no live processor. Marks the SQL payment row as paid.
            </p>
          </form>
        )}
      </section>

      {booking.status === "COMPLETED" ? (
        <section className="mt-6 rounded-2xl border bg-card p-4">
          <h2 className="font-medium">Rate the service</h2>
          {booking.review ? (
            <div className="mt-3">
              <StarRating value={booking.review.rating} readOnly />
              {booking.review.comment ? (
                <p className="mt-2 text-sm text-muted-foreground">{booking.review.comment}</p>
              ) : null}
            </div>
          ) : booking.mechanic ? (
            <form onSubmit={review} className="mt-3 space-y-3">
              <StarRating value={rating} onChange={setRating} />
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How did the stand go?"
              />
              <Button type="submit" className="w-full" disabled={busy === "review"}>
                {busy === "review" ? "Saving…" : "Submit review"}
              </Button>
            </form>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No mechanic to review on this job.</p>
          )}
        </section>
      ) : null}
    </main>
  );
}
