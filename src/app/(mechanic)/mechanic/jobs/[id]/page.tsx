"use client";

import { FormEvent, use, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/pricing";
import { nextStatus, STATUS_LABELS } from "@/lib/booking-flow";
import type { BookingStatus } from "@prisma/client";

type Job = {
  id: string;
  status: BookingStatus;
  mode: "DOORSTEP" | "PICKUP_DROP";
  scheduledAt: string;
  address: string;
  estimatedPrice: number;
  notes: string | null;
  workSummary: string | null;
  mechanicId: string | null;
  service: { name: string };
  bike: { brand: string; model: string };
  customer: { user: { name: string; phone: string | null } };
  parts: { id: string; quantity: number; unitPrice: number; inventoryItem: { name: string } }[];
};

type Stock = { id: string; name: string; quantity: number; unitPrice: number };

export default function MechanicJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [job, setJob] = useState<Job | null>(null);
  const [stock, setStock] = useState<Stock[]>([]);
  const [summary, setSummary] = useState("");
  const [qty, setQty] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const [jobData, inv] = await Promise.all([
      api<{ job: Job }>(`/api/mechanic/jobs/${id}`),
      api<{ items: Stock[] }>("/api/inventory"),
    ]);
    setJob(jobData.job);
    setStock(inv.items);
    setSummary(jobData.job.workSummary ?? "");
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : "Could not load job."));
  }, [id]);

  async function act(action: "accept" | "reject" | "advance" | "complete") {
    setBusy(action);
    setError(null);
    try {
      const parts = Object.entries(qty)
        .filter(([, n]) => n > 0)
        .map(([inventoryItemId, quantity]) => ({ inventoryItemId, quantity }));
      const data = await api<{ job: Job }>(`/api/mechanic/jobs/${id}`, {
        method: "POST",
        body: JSON.stringify({ action, workSummary: summary, parts }),
      });
      setJob(data.job);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setBusy(null);
    }
  }

  if (!job) {
    return (
      <main className="px-5 pt-8 text-sm text-muted-foreground">{error ?? "Loading…"}</main>
    );
  }

  const upcoming = nextStatus(job.status, job.mode);

  return (
    <main className="px-5 pb-10 pt-8">
      <Link href="/mechanic" className="text-sm text-primary">
        All jobs
      </Link>
      <h1 className="font-heading mt-2 text-3xl">{job.service.name}</h1>
      <p className="text-sm text-muted-foreground">
        {job.bike.brand} {job.bike.model} · {STATUS_LABELS[job.status]}
      </p>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

      <section className="mt-5 rounded-2xl border bg-card p-4 text-sm">
        <p><span className="text-muted-foreground">Customer</span> {job.customer.user.name}</p>
        <p><span className="text-muted-foreground">Phone</span> {job.customer.user.phone ?? "—"}</p>
        <p><span className="text-muted-foreground">When</span> {new Date(job.scheduledAt).toLocaleString()}</p>
        <p><span className="text-muted-foreground">Where</span> {job.address}</p>
        <p><span className="text-muted-foreground">Mode</span> {job.mode === "DOORSTEP" ? "Doorstep" : "Pickup & drop"}</p>
        {job.notes ? <p className="mt-2">{job.notes}</p> : null}
      </section>

      {!job.mechanicId ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="outline" disabled={busy !== null} onClick={() => void act("reject")}>
            Reject
          </Button>
          <Button disabled={busy !== null} onClick={() => void act("accept")}>
            Accept
          </Button>
        </div>
      ) : null}

      {job.mechanicId && upcoming && upcoming !== "COMPLETED" ? (
        <Button className="mt-4 w-full" disabled={busy !== null} onClick={() => void act("advance")}>
          Update: {STATUS_LABELS[upcoming]}
        </Button>
      ) : null}

      {job.mechanicId && job.status !== "COMPLETED" && job.status !== "CANCELLED" ? (
        <form
          className="mt-6 space-y-3 rounded-2xl border bg-card p-4"
          onSubmit={(event: FormEvent) => {
            event.preventDefault();
            void act("complete");
          }}
        >
          <h2 className="font-medium">Complete job</h2>
          <Textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Work summary"
          />
          <div className="space-y-2">
            {stock.map((item) => (
              <label key={item.id} className="flex items-center justify-between gap-3 text-sm">
                <span>
                  {item.name} · {formatMoney(item.unitPrice)} · {item.quantity} in stock
                </span>
                <input
                  type="number"
                  min={0}
                  max={item.quantity}
                  className="h-8 w-16 rounded-md border px-2"
                  value={qty[item.id] ?? 0}
                  onChange={(e) => setQty({ ...qty, [item.id]: Number(e.target.value) })}
                />
              </label>
            ))}
          </div>
          <Button type="submit" className="w-full" disabled={busy !== null}>
            Mark completed
          </Button>
        </form>
      ) : null}

      {job.parts.length > 0 ? (
        <ul className="mt-4 text-sm">
          {job.parts.map((part) => (
            <li key={part.id}>
              {part.inventoryItem.name} × {part.quantity} · {formatMoney(part.unitPrice * part.quantity)}
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}
