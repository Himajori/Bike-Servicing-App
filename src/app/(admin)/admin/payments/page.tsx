"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/pricing";

type Payment = {
  id: string;
  amount: number;
  status: string;
  method: string | null;
  paidAt: string | null;
  customer: { user: { name: string } };
  booking: { service: { name: string } };
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  useEffect(() => {
    api<{ payments: Payment[] }>("/api/admin/payments")
      .then((d) => setPayments(d.payments))
      .catch(() => undefined);
  }, []);

  return (
    <main>
      <h1 className="font-heading text-3xl">Payments</h1>
      <div className="mt-4 overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Customer</th>
              <th>Service</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Method</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((row) => (
              <tr key={row.id} className="border-b last:border-0">
                <td className="px-3 py-2">{row.customer.user.name}</td>
                <td>{row.booking.service.name}</td>
                <td>{formatMoney(row.amount)}</td>
                <td>{row.status}</td>
                <td>{row.method ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
