"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/pricing";

type Earnings = {
  total: number;
  completed: number;
  pending: number;
  jobs: { id: string; estimatedPrice: number; status: string; service: { name: string } }[];
};

export default function EarningsPage() {
  const [data, setData] = useState<Earnings | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Earnings>("/api/mechanic/earnings")
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load earnings."));
  }, []);

  return (
    <main className="px-5 pb-8 pt-8">
      <h1 className="font-heading text-3xl">Earnings</h1>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="rounded-2xl border bg-card p-3">
          <p className="text-xs text-muted-foreground">Paid</p>
          <p className="text-lg font-semibold">{formatMoney(data?.total ?? 0)}</p>
        </div>
        <div className="rounded-2xl border bg-card p-3">
          <p className="text-xs text-muted-foreground">Done</p>
          <p className="text-lg font-semibold">{data?.completed ?? 0}</p>
        </div>
        <div className="rounded-2xl border bg-card p-3">
          <p className="text-xs text-muted-foreground">Open</p>
          <p className="text-lg font-semibold">{data?.pending ?? 0}</p>
        </div>
      </div>
      <ul className="mt-5 space-y-2 text-sm">
        {data?.jobs.map((job) => (
          <li key={job.id} className="flex justify-between rounded-xl border bg-card px-3 py-2">
            <span>{job.service.name}</span>
            <span>
              {formatMoney(job.estimatedPrice)} · {job.status}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
