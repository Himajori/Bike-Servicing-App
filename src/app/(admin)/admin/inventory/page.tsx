"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/pricing";

type Item = { id: string; name: string; sku: string; quantity: number; unitPrice: number };

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const data = await api<{ items: Item[] }>("/api/admin/inventory");
    setItems(data.items);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : "Could not load inventory."));
  }, []);

  async function onAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    try {
      await api("/api/admin/inventory", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          sku: form.get("sku"),
          quantity: Number(form.get("quantity")),
          unitPrice: Number(form.get("unitPrice")),
        }),
      });
      event.currentTarget.reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add item.");
    }
  }

  return (
    <main>
      <h1 className="font-heading text-3xl">Inventory</h1>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      <form onSubmit={onAdd} className="mt-4 grid gap-2 sm:grid-cols-5">
        <Input name="name" placeholder="Name" required />
        <Input name="sku" placeholder="SKU" required />
        <Input name="quantity" type="number" min={0} placeholder="Qty" required />
        <Input name="unitPrice" type="number" step="0.01" placeholder="Price" required />
        <Button type="submit">Add part</Button>
      </form>
      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="border-b text-muted-foreground">
            <th className="py-2">Name</th>
            <th>SKU</th>
            <th>Qty</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="py-2">{item.name}</td>
              <td>{item.sku}</td>
              <td>{item.quantity}</td>
              <td>{formatMoney(item.unitPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
