"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bike, CalendarCheck, House, UserRound, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/home", label: "Home", icon: House },
  { href: "/services", label: "Services", icon: Wrench },
  { href: "/bikes", label: "Bikes", icon: Bike },
  { href: "/bookings", label: "Jobs", icon: CalendarCheck },
  { href: "/account", label: "You", icon: UserRound },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-20 border-t bg-card/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur">
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/home" && pathname.startsWith(item.href));
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
                <Icon className={cn("size-5", active && "stroke-[2.4]")} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
