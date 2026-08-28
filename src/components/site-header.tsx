"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommitsMenu } from "@/components/commits-menu";

const links = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#workshops", label: "Workshops" },
  { href: "/login", label: "Mechanic zone" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[oklch(0.22_0.03_50)]/90 text-[oklch(0.97_0.01_80)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-heading text-xl">
          BikeService
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {links.map((link) => (
            <Link key={link.label} href={link.href} className="text-white/80 hover:text-primary">
              {link.label}
            </Link>
          ))}
          <CommitsMenu />
          <Button render={<Link href="/login" />} size="sm" variant="secondary">
            Log in
          </Button>
          <Button render={<Link href="/register" />} size="sm">
            Book a repair
          </Button>
        </nav>
        <button
          type="button"
          className="md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open ? (
        <div className="grid gap-2 border-t border-white/10 px-4 py-3 md:hidden">
          {links.map((link) => (
            <Link key={link.label} href={link.href} className="py-1" onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          <CommitsMenu />
          <Button render={<Link href="/login" />} className="w-full">
            Log in
          </Button>
        </div>
      ) : null}
    </header>
  );
}
