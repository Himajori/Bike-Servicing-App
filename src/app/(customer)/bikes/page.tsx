"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/empty-state";
import { api } from "@/lib/api";

type Bike = {
  id: string;
  brand: string;
  model: string;
  year: number | null;
  registration: string | null;
  color: string | null;
};

export default function BikesPage() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function load() {
    const data = await api<{ bikes: Bike[] }>("/api/bikes");
    setBikes(data.bikes);
  }

  useEffect(() => {
    load()
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load bikes."))
      .finally(() => setLoading(false));
  }, []);

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    const yearRaw = String(form.get("year") || "");
    try {
      await api("/api/bikes", {
        method: "POST",
        body: JSON.stringify({
          brand: form.get("brand"),
          model: form.get("model"),
          year: yearRaw ? Number(yearRaw) : null,
          registration: form.get("registration"),
          color: form.get("color"),
        }),
      });
      formEl.reset();
      setOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add the bike.");
    } finally {
      setPending(false);
    }
  }

  async function remove(id: string) {
    setError(null);
    try {
      await api(`/api/bikes/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove the bike.");
    }
  }

  return (
    <main className="px-5 pb-8 pt-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl">Your bikes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Needed before you can book a service.</p>
        </div>
        <Button size="sm" onClick={() => setOpen((v) => !v)}>
          {open ? "Close" : "Add bike"}
        </Button>
      </div>

      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

      {open ? (
        <form onSubmit={onCreate} className="mt-5 space-y-3 rounded-2xl border bg-card p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" name="brand" required placeholder="Trek" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="model">Model</Label>
              <Input id="model" name="model" required placeholder="Domane" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="year">Year</Label>
              <Input id="year" name="year" type="number" min={1970} placeholder="2022" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="color">Color</Label>
              <Input id="color" name="color" placeholder="Juniper" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="registration">Registration / serial</Label>
            <Input id="registration" name="registration" placeholder="Optional" />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Saving…" : "Save bike"}
          </Button>
        </form>
      ) : null}

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="h-24 animate-pulse rounded-2xl bg-muted" />
        ) : bikes.length === 0 ? (
          <EmptyState
            title="Garage is empty"
            body="Add the bike you want serviced. Brand and model are enough."
          />
        ) : (
          bikes.map((bike) => (
            <article key={bike.id} className="rounded-2xl border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-medium">
                    {bike.brand} {bike.model}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {[bike.year, bike.color, bike.registration].filter(Boolean).join(" · ") ||
                      "No extra details"}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => void remove(bike.id)}>
                  Remove
                </Button>
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  );
}
