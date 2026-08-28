"use client";

import { useEffect, useState } from "react";
import { formatLek, formatMoney } from "@/lib/pricing";
import { type ServiceCity } from "@/lib/maps";

type PricedService = {
  id: string;
  name: string;
  category: string;
  priceMin: number;
  priceMax: number;
  basePrice: number;
};

export function PriceBoard({ city }: { city: ServiceCity }) {
  const [services, setServices] = useState<PricedService[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/services?city=${encodeURIComponent(city.slug)}`)
      .then((res) => res.json())
      .then((data: { services?: PricedService[] }) => {
        if (!alive) return;
        setServices(data.services ?? []);
      })
      .catch(() => {
        if (alive) setError("Could not load the price list.");
      });
    return () => {
      alive = false;
    };
  }, [city.slug]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-3xl sm:text-4xl">Price list — lowest to highest</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Bands start from Albanian shop rates (quick fixes from €5, full service from €25).{" "}
            {city.name} uses a {city.priceIndex.toFixed(2)}× local index
            {city.countryCode === "AL" ? ", shown in euro and lek" : ` vs Tirana`}.
          </p>
        </div>
      </div>
      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
      <ol className="mt-8 grid gap-3 md:grid-cols-2">
        {services.length === 0
          ? Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
            ))
          : services.map((service, index) => (
              <li key={service.id} className="flex items-start justify-between gap-3 rounded-2xl border bg-card p-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    #{index + 1} · {service.category}
                  </p>
                  <p className="mt-1 font-medium">{service.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Typical {band(service.basePrice, service.basePrice, city)}</p>
                </div>
                <p className="text-right text-sm font-semibold">{band(service.priceMin, service.priceMax, city)}</p>
              </li>
            ))}
      </ol>
    </div>
  );
}

function band(min: number, max: number, city: ServiceCity) {
  const euro = min === max ? formatMoney(min) : `${formatMoney(min)} – ${formatMoney(max)}`;
  if (city.countryCode === "AL") {
    return min === max ? `${euro} · ${formatLek(min)}` : `${euro} · ${formatLek(min)}–${formatLek(max)}`;
  }
  return euro;
}
