"use client";

import { useState } from "react";
import { MapPin, CalendarCheck, UserRound, MessageSquare, Bike } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    n: 1,
    title: "Find a workshop or select a city",
    body: "Search the map. Live cities show mechanics you can book the same day.",
    icon: MapPin,
  },
  {
    n: 2,
    title: "Pick a service and tap Book",
    body: "Oil change, tune-up, brakes, e-bike diagnostic — prices are on the card.",
    icon: Bike,
  },
  {
    n: 3,
    title: "Choose a date and how we reach you",
    body: "Doorstep visit or pickup & drop. Drop a pin so the van knows where to stop.",
    icon: CalendarCheck,
  },
  {
    n: 4,
    title: "Enter your details",
    body: "The workshop needs a name, phone, and the bike in your garage.",
    icon: UserRound,
  },
  {
    n: 5,
    title: "Add a comment, then wait for confirmation",
    body: "Tell them about creaks or spare parts. Track status until the stand is clear.",
    icon: MessageSquare,
  },
];

export function HowItWorks() {
  const [active, setActive] = useState(0);
  const step = STEPS[active];
  const Icon = step.icon;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <ol className="space-y-2">
        {STEPS.map((item, index) => (
          <li key={item.n}>
            <button
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                "flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition",
                index === active ? "border-primary bg-accent" : "bg-card hover:border-primary/40",
              )}
            >
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-sm text-primary-foreground">
                {item.n}
              </span>
              <span>
                <span className="block font-medium">{item.title}</span>
                {index === active ? (
                  <span className="mt-1 block text-sm text-muted-foreground">{item.body}</span>
                ) : null}
              </span>
            </button>
          </li>
        ))}
      </ol>
      <div className="relative overflow-hidden rounded-[2rem] border bg-[oklch(0.22_0.03_50)] p-6 text-[oklch(0.97_0.01_80)]">
        <div className="hero-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Step {step.n} of {STEPS.length}</p>
          <Icon className="mt-6 size-10 text-primary" />
          <h3 className="font-heading mt-4 text-3xl">{step.title}</h3>
          <p className="mt-3 max-w-sm text-sm text-white/70">{step.body}</p>
          <div className="mt-8 flex gap-2">
            {STEPS.map((item, index) => (
              <button
                key={item.n}
                type="button"
                aria-label={`Show step ${item.n}`}
                onClick={() => setActive(index)}
                className={cn(
                  "h-1.5 flex-1 rounded-full",
                  index === active ? "bg-primary" : "bg-white/20",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
