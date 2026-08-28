"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/pricing";
import { NotificationInbox } from "@/components/notification-inbox";
import { BookingsTrend, KpiCard, StatusDonut } from "@/components/admin-charts";

type Stats = {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  activeMechanics: number;
  byStatus: Record<string, number>;
  week: { day: string; count: number }[];
  recent: {
    id: string;
    status: string;
    scheduledAt: string;
    service: { name: string };
    customer: { user: { name: string } };
  }[];
};

export default function AdminHome() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Stats>("/api/admin/stats")
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load dashboard."));
  }, []);

  return (
    <main>
      <h1 className="font-heading text-3xl">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Platform overview for BikeService.</p>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total users" value={String(stats?.totalUsers ?? "—")} />
        <KpiCard label="Total bookings" value={String(stats?.totalBookings ?? "—")} />
        <KpiCard label="Revenue" value={stats ? formatMoney(stats.totalRevenue) : "—"} />
        <KpiCard label="Active mechanics" value={String(stats?.activeMechanics ?? "—")} />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card p-4">
          <h2 className="font-medium">Bookings overview</h2>
          <p className="text-sm text-muted-foreground">Last 7 days — hover a point.</p>
          <div className="mt-3">
            <BookingsTrend days={stats?.week ?? []} />
          </div>
        </section>
        <section className="rounded-2xl border bg-card p-4">
          <h2 className="font-medium">Bookings by status</h2>
          <p className="text-sm text-muted-foreground">Hover a slice label to highlight it.</p>
          <div className="mt-3">
            <StatusDonut byStatus={stats?.byStatus ?? {}} />
          </div>
        </section>
      </div>
      <section className="mt-8">
        <h2 className="font-medium">Recent bookings</h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Service</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">When</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recent.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-3 py-2">{row.customer.user.name}</td>
                  <td className="px-3 py-2">{row.service.name}</td>
                  <td className="px-3 py-2">{row.status}</td>
                  <td className="px-3 py-2">{new Date(row.scheduledAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="mt-8">
        <h2 className="font-medium">Alerts</h2>
        <p className="mt-1 text-sm text-muted-foreground">In-app notifications for this admin account.</p>
        <div className="mt-3">
          <NotificationInbox />
        </div>
      </section>
    </main>
  );
}
