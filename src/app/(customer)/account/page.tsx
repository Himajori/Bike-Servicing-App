"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import type { SessionUser } from "@/lib/auth";

type AccountUser = SessionUser & { address?: string | null };

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<AccountUser | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    api<{ user: AccountUser }>("/api/auth/me")
      .then((data) => {
        setUser(data.user);
        setName(data.user.name);
        setPhone(data.user.phone ?? "");
        setAddress(data.user.address ?? "");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load account."));
  }, []);

  async function onSave(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      await api("/api/account", {
        method: "PATCH",
        body: JSON.stringify({ name, phone, address }),
      });
      setMessage("Saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setPending(false);
    }
  }

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="px-5 pb-10 pt-8">
      <h1 className="font-heading text-3xl">You</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Your bike owner account.
      </p>

      <form onSubmit={onSave} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={user?.email ?? ""} disabled />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="address">Service address</Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street, Austin, TX"
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {message ? <p className="text-sm text-primary">{message}</p> : null}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Saving…" : "Save profile"}
        </Button>
      </form>

      <Button variant="outline" className="mt-4 w-full" onClick={() => void logout()}>
        Log out
      </Button>
    </main>
  );
}
