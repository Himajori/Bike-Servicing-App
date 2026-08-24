import Link from "next/link";
import { Bike, MapPin, Clock, ShieldCheck } from "lucide-react";
import { PhoneShell } from "@/components/phone-shell";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <PhoneShell>
      <main className="flex flex-1 flex-col">
        <section className="relative overflow-hidden bg-[oklch(0.22_0.03_50)] px-6 pb-10 pt-14 text-[oklch(0.97_0.01_80)]">
          <div className="absolute -right-10 -top-10 size-40 rounded-full bg-primary/30 blur-2xl" />
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">BikeApp</p>
          <h1 className="font-heading mt-3 text-4xl leading-tight">
            Your bike, serviced at the curb.
          </h1>
          <p className="mt-3 max-w-sm text-sm text-white/70">
            Book a mechanic, pick doorstep or pickup & drop, see the price, and watch the job move.
          </p>
          <div className="mt-8 flex flex-col gap-2">
            <Button render={<Link href="/register" />} size="lg" className="w-full">
              Create an account
            </Button>
            <Button render={<Link href="/login" />} size="lg" variant="secondary" className="w-full">
              Log in
            </Button>
          </div>
        </section>

        <section className="space-y-3 px-5 py-6">
          {[
            {
              icon: Bike,
              title: "Add your bikes",
              body: "Road, city, or e-bike. We price the job against the bike you ride.",
            },
            {
              icon: Clock,
              title: "Pick a slot",
              body: "Morning or evening windows. Doorstep visit or van pickup.",
            },
            {
              icon: MapPin,
              title: "See them coming",
              body: "Live status plus a map of your pin, the workshop, and the mechanic.",
            },
            {
              icon: ShieldCheck,
              title: "Pay and rate",
              body: "Card, UPI, or wallet. Review the mechanic when the stand is clear.",
            },
          ].map((item) => (
            <article key={item.title} className="flex gap-3 rounded-2xl border bg-card p-4">
              <item.icon className="mt-0.5 size-5 text-primary" />
              <div>
                <h2 className="font-medium">{item.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
              </div>
            </article>
          ))}
        </section>
      </main>
    </PhoneShell>
  );
}
