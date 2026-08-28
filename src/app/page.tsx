"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bike, Phone, Wrench, History, MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CitySearch } from "@/components/city-search";
import { RepairCounter } from "@/components/repair-counter";
import { HowItWorks } from "@/components/how-it-works";
import { WorkshopExplorer } from "@/components/workshop-explorer";
import { PriceBoard } from "@/components/price-board";
import { SiteHeader } from "@/components/site-header";
import { api } from "@/lib/api";
import { SERVICE_CITIES, type ServiceCity } from "@/lib/maps";

type Mechanic = {
  id: string;
  name: string;
  specialty: string | null;
  rating: number;
  lat: number | null;
  lng: number | null;
  available: boolean;
};

export default function LandingPage() {
  const [city, setCity] = useState<ServiceCity>(SERVICE_CITIES[0]);
  const [repairs, setRepairs] = useState(294568);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [locating, setLocating] = useState(false);
  const [gpsNote, setGpsNote] = useState<string | null>(null);

  useEffect(() => {
    api<{ repairsDone: number }>("/api/public/stats")
      .then((data) => setRepairs(data.repairsDone))
      .catch(() => undefined);
    api<{ mechanics: Mechanic[] }>("/api/mechanics")
      .then((data) => setMechanics(data.mechanics))
      .catch(() => undefined);
  }, []);

  function chooseCity(next: ServiceCity, note?: string) {
    setCity(next);
    window.localStorage.setItem("bikeservice-city", next.slug);
    setGpsNote(note ?? null);
    document.getElementById("workshops")?.scrollIntoView({ behavior: "smooth" });
  }

  function locate() {
    if (!navigator.geolocation) {
      setGpsNote("This browser has no GPS. Search Tirana or another city.");
      return;
    }
    setLocating(true);
    setGpsNote(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const data = await api<{
            city: ServiceCity;
            km: number;
            label: string | null;
          }>("/api/geo", {
            method: "POST",
            body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          });
          chooseCity(
            data.city,
            data.label
              ? `${data.label} · nearest workshop city ${data.city.name} (${data.km} km)`
              : `GPS locked. Nearest city: ${data.city.name} (${data.km} km).`,
          );
        } catch {
          setGpsNote("Could not match that GPS point to a city.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setGpsNote("Location was blocked. Search a city instead — Tirana is the default.");
      },
      { enableHighAccuracy: true, timeout: 12_000 },
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <section className="relative overflow-hidden bg-[oklch(0.22_0.03_50)] text-[oklch(0.97_0.01_80)]">
        <div className="hero-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -right-10 top-10 h-40 w-[140%] text-primary/25">
          <div className="h-px w-full origin-left animate-[bike-roll_8s_ease-in-out_infinite_alternate] bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:py-24">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">BikeService Albania</p>
            <h1 className="font-heading mt-4 text-4xl leading-tight sm:text-6xl">
              Repair your bike without leaving home
            </h1>
            <p className="mt-4 max-w-xl text-sm text-white/70 sm:text-base">
              GPS map of real bicycle shops from OpenStreetMap — Tirana, Shkodër, Durrës and the rest of
              Albania first. Prices start at €5 / 500 Lek for a flat and climb to a full service.
            </p>
            <div className="mt-8 max-w-xl">
              <CitySearch onSelect={(next) => chooseCity(next)} initial={city.name} locating={locating} onLocate={locate} />
              {gpsNote ? <p className="mt-3 text-xs text-white/60">{gpsNote}</p> : null}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-6">
            <RepairCounter value={repairs} />
            <div className="w-full max-w-xs rounded-[2rem] border border-white/15 bg-black/25 p-4">
              <p className="text-xs uppercase tracking-wide text-white/50">Live in {city.name}</p>
              <p className="mt-1 font-medium">
                OSM bicycle shops on the GPS map · {city.country}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[oklch(0.94_0.016_80)] py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-heading text-3xl sm:text-4xl">Book your repairs 24/7 with BikeService</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Wrench,
                title: "Bicycle repair",
                body: "OpenStreetMap pins for shops and public repair stands. Doorstep or pickup if you cannot roll the bike in.",
              },
              {
                icon: Phone,
                title: "Service prices",
                body: "Every job shows a low-to-high band from Albanian shop rates, then a local index for Kosovo, Greece, Italy, Poland, and the US.",
              },
              {
                icon: History,
                title: "Repair history",
                body: "Keep a personal service book on the bike you ride in Tirana or anywhere else you book.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border bg-card p-6 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                  <item.icon className="size-6" />
                </span>
                <h3 className="mt-4 text-lg font-medium">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="prices" className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <PriceBoard city={city} />
        </div>
      </section>

      <section id="how-it-works" className="bg-[oklch(0.94_0.016_80)] py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-heading text-3xl sm:text-4xl">See how it works</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Share your GPS or pick a city, read the price band, then book. The corner chat also answers how it works.
          </p>
          <div className="mt-8">
            <HowItWorks />
          </div>
        </div>
      </section>

      <section id="workshops" className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-heading text-3xl sm:text-4xl">Find a workshop in your area</h2>
              <p className="mt-2 text-muted-foreground">
                Pins are GPS coordinates from OpenStreetMap bicycle shops and repair stands. Albania is the home map;
                other countries load the same OSM layer.
              </p>
            </div>
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <MapPinned className="size-4 text-primary" />
              Showing {city.name}
            </p>
          </div>
          <div className="mt-8">
            <WorkshopExplorer city={city} mechanics={mechanics} />
          </div>
        </div>
      </section>

      <section className="bg-[oklch(0.94_0.016_80)] py-16">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <Bike className="mx-auto size-8 text-primary" />
          <h2 className="font-heading mt-4 text-3xl">Trusted us</h2>
          <p className="mt-2 text-muted-foreground">
            Demo accounts: alex@rideready.test · maya@rideready.test · admin@rideready.test
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button render={<Link href="/register" />} size="lg">
              Create an account
            </Button>
            <Button render={<Link href="/login" />} size="lg" variant="secondary">
              Log in
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
