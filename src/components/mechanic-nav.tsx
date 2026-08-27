"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Wallet, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/mechanic", label: "Jobs", icon: Briefcase },
  { href: "/mechanic/earnings", label: "Earnings", icon: Wallet },
  { href: "/mechanic/you", label: "You", icon: UserRound },
];

export function MechanicNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 z-20 border-t bg-card/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur">
      <ul className="grid grid-cols-3">
        {items.map((item) => {
          const active =
            item.href === "/mechanic"
              ? pathname === "/mechanic" || pathname.startsWith("/mechanic/jobs")
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
