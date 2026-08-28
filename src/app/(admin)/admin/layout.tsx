import Link from "next/link";
import { AdminSignOut } from "@/components/admin-sign-out";

const links = [
  ["Dashboard", "/admin"],
  ["Users", "/admin/users"],
  ["Mechanics", "/admin/users?role=MECHANIC"],
  ["Bookings", "/admin/bookings"],
  ["Services", "/admin/services"],
  ["Inventory", "/admin/inventory"],
  ["Payments", "/admin/payments"],
  ["Reviews", "/admin/reviews"],
  ["Reports", "/admin/reports"],
  ["Settings", "/admin/settings"],
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[oklch(0.97_0.01_80)]">
      <div className="mx-auto flex min-h-dvh max-w-6xl">
        <aside className="hidden w-52 shrink-0 border-r bg-card p-4 md:block">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">BikeService</p>
          <h1 className="font-heading mt-1 text-lg">Admin</h1>
          <nav className="mt-6 grid gap-1 text-sm">
            {links.map(([label, href]) => (
              <Link key={`${label}-${href}`} href={href} className="rounded-lg px-2 py-1.5 hover:bg-muted">
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-8">
            <AdminSignOut />
          </div>
        </aside>
        <div className="flex-1 p-4 md:p-8">
          <nav className="mb-4 flex flex-wrap gap-2 text-sm md:hidden">
            {links.map(([label, href]) => (
              <Link key={`${label}-m-${href}`} href={href} className="rounded-full bg-card px-3 py-1.5 border">
                {label}
              </Link>
            ))}
            <AdminSignOut />
          </nav>
          {children}
        </div>
      </div>
    </div>
  );
}
