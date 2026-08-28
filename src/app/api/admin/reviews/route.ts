import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const { session, error } = await requireAdmin();
  if (!session) return NextResponse.json({ error }, { status: 401 });
  const prisma = await db();
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: { include: { user: { select: { name: true } } } },
      mechanic: { include: { user: { select: { name: true } } } },
      booking: { include: { service: true } },
    },
    take: 50,
  });
  return NextResponse.json({ reviews });
}
