"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PhoneShell } from "@/components/phone-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      router.push(params.get("next") || "/home");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log in.");
    } finally {
      setPending(false);
    }
  }

  return (
    <PhoneShell>
      <main className="flex flex-1 flex-col px-5 py-10">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">BikeApp</p>
        <h1 className="font-heading mt-2 text-3xl">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Log in to book, track, and pay for bike service.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required defaultValue="alex@rideready.test" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required defaultValue="ride1234" />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in…" : "Log in"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          Demo account is prefilled: alex@rideready.test / ride1234
        </p>
        <p className="mt-4 text-sm">
          New here?{" "}
          <Link href="/register" className="font-medium text-primary underline-offset-2 hover:underline">
            Create an account
          </Link>
        </p>
      </main>
    </PhoneShell>
  );
}
