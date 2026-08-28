"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { api } from "@/lib/api";
import { formatLek, formatMoney } from "@/lib/pricing";

type Service = {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  priceMin: number;
  priceMax: number;
  durationMin: number;
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [category, setCategory] = useState("All");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ services: Service[] }>("/api/services")
      .then((data) => setServices(data.services))
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load services."))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(services.map((s) => s.category)))],
    [services],
  );
  const visible = services.filter((s) => category === "All" || s.category === category);

  return (
    <main className="px-5 pb-8 pt-8">
      <h1 className="font-heading text-3xl">Services</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Bands from Albanian shops, lowest to highest. Travel is added at booking.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`rounded-full px-3 py-1 text-sm ${
              category === item ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

      <div className="mt-5 space-y-3">
        {loading ? (
          <div className="h-32 animate-pulse rounded-2xl bg-muted" />
        ) : visible.length === 0 ? (
          <EmptyState title="No services" body="The catalog is empty. Try again in a moment." />
        ) : (
          visible.map((service) => (
            <Link
              key={service.id}
              href={`/book/${service.id}`}
              className="block rounded-2xl border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-medium">{service.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{service.description}</p>
                </div>
                <p className="text-right font-semibold">
                  {service.priceMin !== service.priceMax
                    ? `${formatMoney(service.priceMin)} – ${formatMoney(service.priceMax)}`
                    : formatMoney(service.basePrice)}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="outline">{service.category}</Badge>
                <span className="text-xs text-muted-foreground">
                  {service.durationMin} min · typical {formatMoney(service.basePrice)} · {formatLek(service.basePrice)}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
