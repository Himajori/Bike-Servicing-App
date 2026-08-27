"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Stats = {
  recent: {
    id: string;
    status: string;
    scheduledAt: string;
    service: { name: string };
    customer: { user: { name: string } };
  }[];
};

export default function AdminBookingsPage() {
  const [rows, setRows] = useState<Stats["recent"]>([]);
  useEffect(() => {
    api<Stats>("/api/admin/stats").then((d) => setRows(d.recent)).catch(() => undefined);
  }, []);
  return (
    <main>
      <h1 className="font-heading text-3xl">Bookings</h1>
      <table className="mt-4 w-full text-left text-sm">
        <thead>
          <tr className="border-b text-muted-foreground">
            <th className="py-2">Customer</th>
            <th>Service</th>
            <th>Status</th>
            <th>When</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b">
              <td className="py-2">{row.customer.user.name}</td>
              <td>{row.service.name}</td>
              <td>{row.status}</td>
              <td>{new Date(row.scheduledAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
