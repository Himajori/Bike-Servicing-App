"use client";

import { FormEvent, useMemo, useState } from "react";
import { LocateFixed, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SERVICE_CITIES, type ServiceCity } from "@/lib/maps";

export function CitySearch({
  onSelect,
  initial = "Tirana",
  locating = false,
  onLocate,
}: {
  onSelect: (city: ServiceCity) => void;
  initial?: string;
  locating?: boolean;
  onLocate?: () => void;
}) {
  const [query, setQuery] = useState(initial);
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SERVICE_CITIES;
    return SERVICE_CITIES.filter(
      (city) =>
        city.name.toLowerCase().includes(q) ||
        city.country.toLowerCase().includes(q) ||
        city.countryCode.toLowerCase().includes(q),
    );
  }, [query]);

  function pick(city: ServiceCity) {
    setQuery(city.name);
    setOpen(false);
    onSelect(city);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    pick(matches[0] ?? SERVICE_CITIES[0]);
  }

  return (
    <div className="w-full space-y-2">
      <form onSubmit={onSubmit} className="relative w-full">
        <div className="flex overflow-hidden rounded-full bg-white shadow-lg">
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Tirana, Shkodër, Roma…"
            className="h-12 flex-1 border-0 bg-transparent px-5 text-base text-foreground shadow-none focus-visible:ring-0"
            aria-label="Select city"
            autoComplete="off"
          />
          <Button type="submit" size="lg" className="m-1 h-10 rounded-full px-5">
            <Search className="size-4" />
            Search
          </Button>
        </div>
        {open ? (
          <ul className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-2xl border bg-card p-1 shadow-xl">
            {matches.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">No city matches that search.</li>
            ) : (
              matches.map((city) => (
                <li key={city.slug}>
                  <button
                    type="button"
                    onClick={() => pick(city)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    <span>
                      {city.name}
                      <span className="ml-2 text-xs text-muted-foreground">{city.country}</span>
                    </span>
                    <span className="text-xs text-primary">{city.featured ? "Albania" : "Map + prices"}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        ) : null}
      </form>
      {onLocate ? (
        <Button type="button" variant="secondary" className="w-full rounded-full" onClick={onLocate} disabled={locating}>
          <LocateFixed className="size-4" />
          {locating ? "Reading GPS…" : "Use my GPS"}
        </Button>
      ) : null}
    </div>
  );
}
