import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const { session, error } = await requireAdmin();
  if (!session) return NextResponse.json({ error }, { status: 401 });
  const prisma = await db();
  const [byService, paid, reviews] = await Promise.all([
    prisma.booking.groupBy({ by: ["serviceId"], _count: true, _sum: { estimatedPrice: true } }),
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true }, _count: true }),
    prisma.review.aggregate({ _avg: { rating: true }, _count: true }),
  ]);
  const services = await prisma.service.findMany({ select: { id: true, name: true } });
  const names = Object.fromEntries(services.map((s) => [s.id, s.name]));
  return NextResponse.json({
    byService: byService.map((row) => ({
      name: names[row.serviceId] ?? "Service",
      bookings: row._count,
      estimated: row._sum.estimatedPrice ?? 0,
    })),
    paidCount: paid._count,
    paidTotal: paid._sum.amount ?? 0,
    reviewCount: reviews._count,
    avgRating: reviews._avg.rating ?? 0,
  });
}
