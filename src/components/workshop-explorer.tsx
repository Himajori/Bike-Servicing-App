"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ServiceMap } from "@/components/service-map";
import { type MapMarker, type ServiceCity } from "@/lib/maps";
import { formatPriceRange } from "@/lib/pricing";

type Mechanic = {
  id: string;
  name: string;
  specialty: string | null;
  rating: number;
  lat: number | null;
  lng: number | null;
  available: boolean;
};

type OsmWorkshop = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  services: string;
  kind?: string;
  phone?: string | null;
};

export function WorkshopExplorer({
  city,
  mechanics,
}: {
  city: ServiceCity;
  mechanics: Mechanic[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [osm, setOsm] = useState<OsmWorkshop[]>([]);
  const [source, setSource] = useState<string>("openstreetmap");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setSelectedId(null);
    fetch(`/api/shops?city=${encodeURIComponent(city.slug)}`)
      .then((res) => res.json())
      .then((data: { workshops?: OsmWorkshop[]; source?: string }) => {
        if (!alive) return;
        setOsm(data.workshops ?? []);
        setSource(data.source ?? "openstreetmap");
      })
      .catch(() => {
        if (alive) setOsm([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [city.slug]);

  const workshops = osm.length > 0 ? osm : city.workshops;

  const markers: MapMarker[] = useMemo(() => {
    const list: MapMarker[] = workshops.map((shop) => ({
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
        if (city.countryCode !== "AL") continue;
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
  }, [city, mechanics, workshops]);

  const selected =
    workshops.find((w) => w.id === selectedId) ?? mechanics.find((m) => m.id === selectedId) ?? null;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <ServiceMap
        key={city.slug}
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
          {loading
            ? `Loading OpenStreetMap bicycle shops in ${city.name}…`
            : `${markers.length} GPS pins in ${city.name}, ${city.country}. Prices here run ${formatPriceRange(5, 80, city)} for typical jobs. Source: ${source === "openstreetmap" ? "OpenStreetMap" : "OpenStreetMap cache"}.`}
        </p>
        <ul className="max-h-[22rem] space-y-2 overflow-auto pr-1">
          {workshops.map((shop) => (
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
          {city.countryCode === "AL"
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
        <Button render={<Link href="/register" />} className="w-full" size="lg">
          Book a repair in {city.name}
        </Button>
      </div>
    </div>
  );
}
