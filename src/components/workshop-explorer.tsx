"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ServiceMap } from "@/components/service-map";
import { type MapMarker, type ServiceCity } from "@/lib/maps";

type Mechanic = {
  id: string;
  name: string;
  specialty: string | null;
  rating: number;
  lat: number | null;
  lng: number | null;
  available: boolean;
};

export function WorkshopExplorer({
  city,
  mechanics,
}: {
  city: ServiceCity;
  mechanics: Mechanic[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const markers: MapMarker[] = useMemo(() => {
    const list: MapMarker[] = city.workshops.map((shop) => ({
      id: shop.id,
      lat: shop.lat,
      lng: shop.lng,
      label: shop.name.replace("BikeService ", ""),
      kind: "workshop",
      detail: shop.address,
    }));
    if (city.live) {
      for (const mechanic of mechanics) {
        if (!mechanic.lat || !mechanic.lng) continue;
        list.push({
          id: mechanic.id,
          lat: mechanic.lat,
          lng: mechanic.lng,
          label: mechanic.name.split(" ")[0],
          kind: "mechanic",
          detail: mechanic.specialty ?? "Mobile mechanic",
        });
      }
    }
    return list;
  }, [city, mechanics]);

  const selected =
    city.workshops.find((w) => w.id === selectedId) ??
    mechanics.find((m) => m.id === selectedId) ??
    null;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <ServiceMap
        center={city.center}
        bounds={city.bounds}
        markers={markers}
        selectedId={selectedId}
        onSelect={setSelectedId}
        showLegend
        className="h-[22rem] lg:h-[28rem]"
      />
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {city.live
            ? `${markers.length} points in ${city.name} — tap a pin or a card.`
            : `${city.name} is on the waitlist. Austin is live for demo bookings.`}
        </p>
        <ul className="space-y-2">
          {city.workshops.map((shop) => (
            <li key={shop.id}>
              <button
                type="button"
                onClick={() => setSelectedId(shop.id)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  selectedId === shop.id ? "border-primary bg-accent" : "bg-card hover:border-primary/50"
                }`}
              >
                <p className="font-medium">{shop.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{shop.address}</p>
                <p className="mt-1 text-xs text-primary">{shop.services}</p>
              </button>
            </li>
          ))}
          {city.live
            ? mechanics.map((mechanic) => (
                <li key={mechanic.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(mechanic.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selectedId === mechanic.id
                        ? "border-primary bg-accent"
                        : "bg-card hover:border-primary/50"
                    }`}
                  >
                    <p className="font-medium">{mechanic.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {mechanic.specialty} · {mechanic.rating.toFixed(1)}★
                    </p>
                    <p className="mt-1 text-xs text-primary">
                      {mechanic.available ? "Available today" : "Off shift"}
                    </p>
                  </button>
                </li>
              ))
            : null}
        </ul>
        {selected && "address" in selected ? (
          <p className="text-sm text-muted-foreground">Selected workshop: {selected.name}</p>
        ) : null}
        <Button render={<Link href={city.live ? "/register" : "/register"} />} className="w-full" size="lg">
          {city.live ? "Book a repair here" : "Join the waitlist"}
        </Button>
      </div>
    </div>
  );
}
