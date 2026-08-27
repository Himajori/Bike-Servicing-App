"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/pricing";
import { STATUS_LABELS } from "@/lib/booking-flow";

type Job = {
  id: string;
  status: keyof typeof STATUS_LABELS;
  mode: "DOORSTEP" | "PICKUP_DROP";
  scheduledAt: string;
  estimatedPrice: number;
  mechanicId: string | null;
  service: { name: string };
  bike: { brand: string; model: string };
};

export default function MechanicJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [tab, setTab] = useState<"new" | "accepted" | "completed">("new");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const data = await api<{ jobs: Job[] }>("/api/mechanic/jobs");
    setJobs(data.jobs);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : "Could not load jobs."));
  }, []);

  const visible = jobs.filter((job) => {
    if (tab === "new") return !job.mechanicId && job.status === "REQUESTED";
    if (tab === "completed") return job.status === "COMPLETED";
    return job.mechanicId && job.status !== "COMPLETED" && job.status !== "CANCELLED";
  });

  return (
    <main className="px-5 pb-8 pt-8">
      <h1 className="font-heading text-3xl">Service requests</h1>
      <p className="mt-1 text-sm text-muted-foreground">Accept, update progress, and close jobs.</p>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      <div className="mt-4 flex gap-2">
        {(["new", "accepted", "completed"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`rounded-full px-3 py-1 text-sm capitalize ${
              tab === item ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {visible.map((job) => (
          <article key={job.id} className="rounded-2xl border bg-card p-4">
            <div className="flex justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">{job.id.slice(-6).toUpperCase()}</p>
                <h2 className="font-medium">{job.service.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {job.bike.brand} {job.bike.model} · {job.mode === "DOORSTEP" ? "Doorstep" : "Pickup"}
                </p>
              </div>
              <Badge>{STATUS_LABELS[job.status]}</Badge>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span>{new Date(job.scheduledAt).toLocaleString()}</span>
              <span className="font-medium">{formatMoney(job.estimatedPrice)}</span>
            </div>
            <Button render={<Link href={`/mechanic/jobs/${job.id}`} />} className="mt-3 w-full" size="sm">
              Open job
            </Button>
          </article>
        ))}
        {visible.length === 0 ? <p className="text-sm text-muted-foreground">Nothing in this tab.</p> : null}
      </div>
    </main>
  );
}
