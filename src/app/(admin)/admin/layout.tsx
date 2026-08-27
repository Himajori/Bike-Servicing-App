import Link from "next/link";

const links = [
  ["Dashboard", "/admin"],
  ["Users", "/admin/users"],
  ["Inventory", "/admin/inventory"],
  ["Bookings", "/admin/bookings"],
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
              <Link key={href} href={href} className="rounded-lg px-2 py-1.5 hover:bg-muted">
                {label}
              </Link>
            ))}
          </nav>
          <Link href="/login" className="mt-8 block text-sm text-muted-foreground">
            Sign out via account login
          </Link>
        </aside>
        <div className="flex-1 p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
