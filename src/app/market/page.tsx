"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatMoney } from "@/lib/pricing";

type Listing = {
  id: string;
  brand: string;
  model: string;
  year: number | null;
  color: string | null;
  description: string;
  price: number;
  city: string;
  imageUrl: string | null;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string | null;
};

export default function MarketPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [tab, setTab] = useState<"buy" | "sell">("buy");
  const [selected, setSelected] = useState<Listing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function load(nextQuery = query, nextCity = city) {
    const params = new URLSearchParams();
    if (nextQuery) params.set("q", nextQuery);
    if (nextCity) params.set("city", nextCity);
    const response = await fetch(`/api/market?${params.toString()}`);
    const data = (await response.json()) as { listings: Listing[] };
    setListings(data.listings);
  }

  useEffect(() => {
    load().catch(() => setError("Could not load bikes for sale."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cities = useMemo(
    () => Array.from(new Set(listings.map((item) => item.city))).sort(),
    [listings],
  );

  async function onSearch(event: FormEvent) {
    event.preventDefault();
    setError(null);
    await load(query, city);
  }

  async function onSell(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/market", { method: "POST", body: new FormData(form) });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Could not list the bike.");
      form.reset();
      setMessage("Listed. Buyers can search it now.");
      setTab("buy");
      setQuery("");
      setCity("");
      await load("", "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not list the bike.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Bikes</p>
        <h1 className="font-heading mt-2 text-4xl">Buy or list a bike</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Search what’s for sale, or upload your bike with a photo and description.
        </p>

        <div className="mt-6 flex gap-2">
          {(["buy", "sell"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`rounded-full px-4 py-1.5 text-sm capitalize ${
                tab === item ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {item === "buy" ? "Search to buy" : "Upload a bike"}
            </button>
          ))}
        </div>

        {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
        {message ? <p className="mt-4 text-sm text-primary">{message}</p> : null}

        {tab === "buy" ? (
          <>
            <form onSubmit={onSearch} className="mt-6 flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search brand, model, or description"
                  className="h-11 pl-9"
                />
              </div>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                list="market-cities"
                className="h-11 sm:w-40"
              />
              <datalist id="market-cities">
                {cities.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
              <Button type="submit" className="h-11">
                Search
              </Button>
            </form>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <button
                  key={listing.id}
                  type="button"
                  onClick={() => setSelected(listing)}
                  className="overflow-hidden rounded-3xl border bg-card text-left transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div
                    className="h-40 bg-muted bg-cover bg-center"
                    style={{
                      backgroundImage: listing.imageUrl ? `url(${listing.imageUrl})` : undefined,
                    }}
                  />
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground">
                      {listing.city}
                      {listing.year ? ` · ${listing.year}` : ""}
                    </p>
                    <h2 className="mt-1 font-medium">
                      {listing.brand} {listing.model}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{listing.description}</p>
                    <p className="mt-3 font-semibold">{formatMoney(listing.price)}</p>
                  </div>
                </button>
              ))}
            </div>
            {listings.length === 0 ? (
              <p className="mt-8 text-sm text-muted-foreground">No bikes match that search. Try another city or list yours.</p>
            ) : null}
          </>
        ) : (
          <form onSubmit={onSell} className="mt-6 grid max-w-2xl gap-4 rounded-3xl border bg-card p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" name="brand" required placeholder="Trek" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="model">Model</Label>
                <Input id="model" name="model" required placeholder="Domane AL 4" />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="year">Year</Label>
                <Input id="year" name="year" type="number" min={1970} placeholder="2022" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="color">Color</Label>
                <Input id="color" name="color" placeholder="Juniper" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price">Price</Label>
                <Input id="price" name="price" type="number" min={1} step="0.01" required placeholder="980" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" required placeholder="Tirana" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                required
                minLength={8}
                placeholder="Size, condition, service history, what’s included…"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="photo">Photo</Label>
              <Input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" />
              <p className="text-xs text-muted-foreground">JPG, PNG, or WebP, up to 3 MB. Optional photo URL below.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="imageUrl">Or photo URL</Label>
              <Input id="imageUrl" name="imageUrl" placeholder="https://" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="sellerName">Your name</Label>
                <Input id="sellerName" name="sellerName" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sellerEmail">Email</Label>
                <Input id="sellerEmail" name="sellerEmail" type="email" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sellerPhone">Phone</Label>
                <Input id="sellerPhone" name="sellerPhone" />
              </div>
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? "Uploading…" : "List this bike"}
            </Button>
          </form>
        )}
      </main>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="max-h-[90dvh] w-full max-w-lg overflow-auto rounded-3xl bg-card p-5 shadow-xl">
            {selected.imageUrl ? (
              <div
                className="mb-4 h-48 w-full rounded-2xl bg-muted bg-cover bg-center"
                style={{ backgroundImage: `url(${selected.imageUrl})` }}
              />
            ) : null}
            <p className="text-xs text-muted-foreground">{selected.city}</p>
            <h2 className="font-heading text-2xl">
              {selected.brand} {selected.model}
            </h2>
            <p className="mt-1 font-semibold">{formatMoney(selected.price)}</p>
            <p className="mt-3 text-sm text-muted-foreground">{selected.description}</p>
            <div className="mt-4 rounded-2xl bg-muted p-3 text-sm">
              <p className="font-medium">Seller</p>
              <p>{selected.sellerName}</p>
              <a className="text-primary" href={`mailto:${selected.sellerEmail}`}>
                {selected.sellerEmail}
              </a>
              {selected.sellerPhone ? <p>{selected.sellerPhone}</p> : null}
            </div>
            <Button className="mt-4 w-full" variant="outline" onClick={() => setSelected(null)}>
              Close
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
