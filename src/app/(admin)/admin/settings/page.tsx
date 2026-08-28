"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

type AppSettings = {
  workshopName: string;
  supportEmail: string;
  doorstepTravel: number;
  pickupTravel: number;
  ageSurcharge: number;
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ settings: AppSettings }>("/api/admin/settings")
      .then((d) => setSettings(d.settings))
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load settings."));
  }, []);

  async function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!settings) return;
    setError(null);
    try {
      const data = await api<{ settings: AppSettings }>("/api/admin/settings", {
        method: "PATCH",
        body: JSON.stringify(settings),
      });
      setSettings(data.settings);
      setMessage("Saved. New quotes use these travel fees.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    }
  }

  if (!settings) {
    return <main className="text-sm text-muted-foreground">{error ?? "Loading…"}</main>;
  }

  return (
    <main>
      <h1 className="font-heading text-3xl">Settings</h1>
      <form onSubmit={onSave} className="mt-6 max-w-lg space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="workshopName">Workshop name</Label>
          <Input
            id="workshopName"
            value={settings.workshopName}
            onChange={(e) => setSettings({ ...settings, workshopName: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="supportEmail">Support email</Label>
          <Input
            id="supportEmail"
            type="email"
            value={settings.supportEmail}
            onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="doorstep">Doorstep $</Label>
            <Input
              id="doorstep"
              type="number"
              min={0}
              step="0.01"
              value={settings.doorstepTravel}
              onChange={(e) => setSettings({ ...settings, doorstepTravel: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pickup">Pickup $</Label>
            <Input
              id="pickup"
              type="number"
              min={0}
              step="0.01"
              value={settings.pickupTravel}
              onChange={(e) => setSettings({ ...settings, pickupTravel: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="age">Age fee $</Label>
            <Input
              id="age"
              type="number"
              min={0}
              step="0.01"
              value={settings.ageSurcharge}
              onChange={(e) => setSettings({ ...settings, ageSurcharge: Number(e.target.value) })}
            />
          </div>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {message ? <p className="text-sm text-primary">{message}</p> : null}
        <Button type="submit">Save settings</Button>
      </form>
    </main>
  );
}
