import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireMechanic } from "@/lib/auth";

export async function GET() {
  const { session, error } = await requireMechanic();
  if (!session) return NextResponse.json({ error }, { status: 401 });
  const prisma = await db();
  const jobs = await prisma.booking.findMany({
    where: { mechanicId: session.mechanicId! },
    include: { payment: true, service: true },
  });
  const completed = jobs.filter((j) => j.status === "COMPLETED");
  const paid = completed.filter((j) => j.payment?.status === "PAID");
  const total = paid.reduce((sum, j) => sum + j.estimatedPrice, 0);
  return NextResponse.json({
    total,
    completed: completed.length,
    pending: jobs.filter((j) => !["COMPLETED", "CANCELLED"].includes(j.status)).length,
    jobs: jobs.slice(0, 12),
  });
}
