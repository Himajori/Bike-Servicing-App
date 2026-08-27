import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireMechanic } from "@/lib/auth";

const include = {
  service: true,
  bike: true,
  customer: { include: { user: { select: { name: true, phone: true } } } },
  payment: true,
  parts: { include: { inventoryItem: true } },
  statusLogs: { orderBy: { createdAt: "asc" as const } },
};

export async function GET() {
  const { session, error } = await requireMechanic();
  if (!session) return NextResponse.json({ error }, { status: 401 });
  const prisma = await db();
  const jobs = await prisma.booking.findMany({
    where: {
      OR: [{ mechanicId: session.mechanicId! }, { mechanicId: null, status: "REQUESTED" }],
    },
    include,
    orderBy: { scheduledAt: "desc" },
  });
  return NextResponse.json({ jobs });
}
