"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/pricing";

type Service = {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  priceMin: number;
  priceMax: number;
  durationMin: number;
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const data = await api<{ services: Service[] }>("/api/admin/services");
    setServices(data.services);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : "Could not load services."));
  }, []);

  async function save(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    try {
      await api("/api/admin/services", {
        method: "PATCH",
        body: JSON.stringify({
          id,
          basePrice: Number(form.get("basePrice")),
          priceMin: Number(form.get("priceMin")),
          priceMax: Number(form.get("priceMax")),
          durationMin: Number(form.get("durationMin")),
        }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save price.");
    }
  }

  return (
    <main>
      <h1 className="font-heading text-3xl">Services</h1>
      <p className="mt-1 text-sm text-muted-foreground">Edit low / typical / high euro prices. New bookings pick up the change immediately.</p>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      <div className="mt-4 space-y-3">
        {services.map((service) => (
          <form
            key={service.id}
            onSubmit={(event) => void save(event, service.id)}
            className="grid gap-2 rounded-2xl border bg-card p-4 sm:grid-cols-[1fr_6rem_6rem_6rem_6rem_auto]"
          >
            <div>
              <p className="font-medium">{service.name}</p>
              <p className="text-xs text-muted-foreground">{service.category}</p>
            </div>
            <Input name="priceMin" type="number" step="0.01" min={1} defaultValue={service.priceMin} aria-label="Lowest" />
            <Input name="basePrice" type="number" step="0.01" min={1} defaultValue={service.basePrice} aria-label="Typical" />
            <Input name="priceMax" type="number" step="0.01" min={1} defaultValue={service.priceMax} aria-label="Highest" />
            <Input name="durationMin" type="number" min={10} defaultValue={service.durationMin} aria-label="Minutes" />
            <Button type="submit" size="sm">
              Save {formatMoney(service.basePrice)}
            </Button>
          </form>
        ))}
      </div>
    </main>
  );
}
