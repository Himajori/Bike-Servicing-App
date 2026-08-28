"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/pricing";

type Report = {
  byService: { name: string; bookings: number; estimated: number }[];
  paidCount: number;
  paidTotal: number;
  reviewCount: number;
  avgRating: number;
};

export default function AdminReportsPage() {
  const [report, setReport] = useState<Report | null>(null);
  useEffect(() => {
    api<Report>("/api/admin/reports")
      .then(setReport)
      .catch(() => undefined);
  }, []);

  return (
    <main>
      <h1 className="font-heading text-3xl">Reports</h1>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Paid volume</p>
          <p className="mt-1 text-2xl font-semibold">{formatMoney(report?.paidTotal ?? 0)}</p>
          <p className="text-sm text-muted-foreground">{report?.paidCount ?? 0} receipts</p>
        </article>
        <article className="rounded-2xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Average rating</p>
          <p className="mt-1 text-2xl font-semibold">{(report?.avgRating ?? 0).toFixed(1)}★</p>
          <p className="text-sm text-muted-foreground">{report?.reviewCount ?? 0} reviews</p>
        </article>
        <article className="rounded-2xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Catalog jobs</p>
          <p className="mt-1 text-2xl font-semibold">{report?.byService.length ?? 0}</p>
          <p className="text-sm text-muted-foreground">services booked</p>
        </article>
      </div>
      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="border-b text-muted-foreground">
            <th className="py-2">Service</th>
            <th>Bookings</th>
            <th>Estimated</th>
          </tr>
        </thead>
        <tbody>
          {report?.byService.map((row) => (
            <tr key={row.name} className="border-b">
              <td className="py-2">{row.name}</td>
              <td>{row.bookings}</td>
              <td>{formatMoney(row.estimated)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
