"use client";

import { FormEvent, use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ServiceMap } from "@/components/service-map";
import { EmptyState } from "@/components/empty-state";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/pricing";
import { CITY, SAVED_PLACES, type MapMarker } from "@/lib/maps";

type Service = {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  durationMin: number;
};
type Bike = { id: string; brand: string; model: string; year: number | null };
type Quote = { basePrice: number; travel: number; ageSurcharge: number; total: number };
type Mechanic = { id: string; name: string; lat: number | null; lng: number | null };

export default function BookPage({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = use(params);
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [bikeId, setBikeId] = useState("");
  const [mode, setMode] = useState<"DOORSTEP" | "PICKUP_DROP">("DOORSTEP");
  const [scheduledAt, setScheduledAt] = useState(defaultSlot());
  const [place, setPlace] = useState(SAVED_PLACES[0]);
  const [notes, setNotes] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    Promise.all([
      api<{ services: Service[] }>("/api/services"),
      api<{ bikes: Bike[] }>("/api/bikes"),
      api<{ mechanics: Mechanic[] }>("/api/mechanics"),
    ])
      .then(([svc, bikeData, mech]) => {
        const found = svc.services.find((s) => s.id === serviceId) ?? null;
        setService(found);
        setBikes(bikeData.bikes);
        setBikeId(bikeData.bikes[0]?.id ?? "");
        setMechanics(mech.mechanics);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not open booking."))
      .finally(() => setLoading(false));
  }, [serviceId]);

  useEffect(() => {
    if (!service) return;
    api<{ quote: Quote }>("/api/quote", {
      method: "POST",
      body: JSON.stringify({ serviceId, bikeId: bikeId || undefined, mode }),
    })
      .then((data) => setQuote(data.quote))
      .catch(() => setQuote(null));
  }, [service, serviceId, bikeId, mode]);

  const markers: MapMarker[] = useMemo(
    () => [
      { id: "pin", lat: place.lat, lng: place.lng, label: "You", kind: "pin" },
      {
        id: "shop",
        lat: CITY.workshop.lat,
        lng: CITY.workshop.lng,
        label: "Workshop",
        kind: "workshop",
      },
      ...mechanics
        .filter((m) => m.lat && m.lng)
        .map((m) => ({
          id: m.id,
          lat: m.lat!,
          lng: m.lng!,
          label: m.name.split(" ")[0],
          kind: "mechanic" as const,
        })),
    ],
    [place, mechanics],
  );

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const result = await api<{ booking: { id: string } }>("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          serviceId,
          bikeId,
          mode,
          scheduledAt: new Date(scheduledAt).toISOString(),
          address: place.address,
          lat: place.lat,
          lng: place.lng,
          notes,
        }),
      });
      router.push(`/bookings/${result.booking.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not book.");
    } finally {
      setPending(false);
    }
  }

  if (loading) {
    return (
      <main className="px-5 pt-8">
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
      </main>
    );
  }

  if (!service) {
    return (
      <main className="px-5 pt-8">
        <EmptyState title="Service missing" body="That catalog item is gone." />
      </main>
    );
  }

  return (
    <main className="px-5 pb-10 pt-8">
      <Link href="/services" className="text-sm text-primary">
        All services
      </Link>
      <h1 className="font-heading mt-2 text-3xl">{service.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {service.description} · {service.durationMin} min
      </p>

      {bikes.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Add a bike first"
            body="Bookings are always tied to one of your bikes."
            action={
              <Button render={<Link href="/bikes" />}>Open garage</Button>
            }
          />
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-6">
          <fieldset className="space-y-2">
            <Label>Bike</Label>
            <div className="space-y-2">
              {bikes.map((bike) => (
                <label
                  key={bike.id}
                  className={`flex items-center justify-between rounded-xl border p-3 ${
                    bikeId === bike.id ? "border-primary bg-accent" : "bg-card"
                  }`}
                >
                  <span>
                    {bike.brand} {bike.model}
                    {bike.year ? ` · ${bike.year}` : ""}
                  </span>
                  <input
                    type="radio"
                    name="bike"
                    checked={bikeId === bike.id}
                    onChange={() => setBikeId(bike.id)}
                  />
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <Label>How we reach you</Label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["DOORSTEP", "Doorstep"],
                  ["PICKUP_DROP", "Pickup & drop"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setMode(value);
                    if (value === "PICKUP_DROP") setPlace(SAVED_PLACES[2]);
                    if (value === "DOORSTEP") setPlace(SAVED_PLACES[0]);
                  }}
                  className={`rounded-xl border p-3 text-sm font-medium ${
                    mode === value ? "border-primary bg-accent" : "bg-card"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {mode === "DOORSTEP"
                ? "A mechanic comes to the pin you drop."
                : "A van collects the bike and returns it after the stand."}
            </p>
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="when">Date and time</Label>
            <input
              id="when"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="h-9 w-full rounded-lg border bg-card px-3 text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <div className="flex flex-wrap gap-2">
              {SAVED_PLACES.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setPlace(item)}
                  className={`rounded-full px-3 py-1 text-xs ${
                    place.label === item.label
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <ServiceMap
              center={{ lat: place.lat, lng: place.lng }}
              markers={markers}
              onPick={(lat, lng) =>
                setPlace({
                  label: "Dropped pin",
                  address: `Custom pin near ${lat.toFixed(3)}, ${lng.toFixed(3)}, Austin, TX`,
                  lat,
                  lng,
                })
              }
              className="h-52"
            />
            <p className="text-xs text-muted-foreground">{place.address}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes for the mechanic</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Creaks, last service, spare parts you already bought…"
            />
          </div>

          <section className="rounded-2xl border bg-card p-4">
            <h2 className="font-medium">Estimated price</h2>
            {quote ? (
              <ul className="mt-3 space-y-1 text-sm">
                <li className="flex justify-between">
                  <span>Service</span>
                  <span>{formatMoney(quote.basePrice)}</span>
                </li>
                <li className="flex justify-between text-muted-foreground">
                  <span>{mode === "PICKUP_DROP" ? "Pickup & drop" : "Doorstep travel"}</span>
                  <span>{formatMoney(quote.travel)}</span>
                </li>
                {quote.ageSurcharge > 0 ? (
                  <li className="flex justify-between text-muted-foreground">
                    <span>Older bike care</span>
                    <span>{formatMoney(quote.ageSurcharge)}</span>
                  </li>
                ) : null}
                <li className="flex justify-between border-t pt-2 font-semibold">
                  <span>Total</span>
                  <span>{formatMoney(quote.total)}</span>
                </li>
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Calculating…</p>
            )}
          </section>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="w-full" size="lg" disabled={pending || !bikeId}>
            {pending ? "Booking…" : "Confirm booking"}
          </Button>
        </form>
      )}
    </main>
  );
}

function defaultSlot() {
  const date = new Date(Date.now() + 1000 * 60 * 60 * 24);
  date.setMinutes(0, 0, 0);
  date.setHours(10);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:00`;
}
