"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PhoneShell } from "@/components/phone-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
          phone: form.get("phone"),
          address: form.get("address"),
        }),
      });
      router.push("/home");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the account.");
    } finally {
      setPending(false);
    }
  }

  return (
    <PhoneShell>
      <main className="flex flex-1 flex-col px-5 py-10">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">BikeApp</p>
        <h1 className="font-heading mt-2 text-3xl">Create your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Register as a bike owner to add bikes, book a service, and track the job.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" required placeholder="Sam Okonkwo" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="you@email.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" placeholder="+1 512 555 0101" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Home address</Label>
            <Input id="address" name="address" placeholder="Street, Austin, TX" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required minLength={6} />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Creating…" : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary underline-offset-2 hover:underline">
            Log in
          </Link>
        </p>
      </main>
    </PhoneShell>
  );
}
