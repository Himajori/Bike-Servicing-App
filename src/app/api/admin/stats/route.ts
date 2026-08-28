import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const { session, error } = await requireAdmin();
  if (!session) return NextResponse.json({ error }, { status: 401 });
  const prisma = await db();
  const [users, bookings, paid, mechanics, recent] = await Promise.all([
    prisma.user.count(),
    prisma.booking.count(),
    prisma.payment.findMany({ where: { status: "PAID" } }),
    prisma.mechanic.count({ where: { available: true } }),
    prisma.booking.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { include: { user: { select: { name: true } } } },
        service: true,
      },
    }),
  ]);
  const byStatus = await prisma.booking.groupBy({ by: ["status"], _count: true });
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - 6);
  const weekRows = await prisma.booking.findMany({
    where: { createdAt: { gte: weekStart } },
    select: { createdAt: true },
  });
  const byDay = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    byDay.set(day.toISOString().slice(0, 10), 0);
  }
  for (const row of weekRows) {
    const key = row.createdAt.toISOString().slice(0, 10);
    if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }
  return NextResponse.json({
    totalUsers: users,
    totalBookings: bookings,
    totalRevenue: paid.reduce((s, p) => s + p.amount, 0),
    activeMechanics: mechanics,
    byStatus: Object.fromEntries(byStatus.map((row) => [row.status, row._count])),
    week: [...byDay.entries()].map(([day, count]) => ({ day, count })),
    recent,
  });
}
