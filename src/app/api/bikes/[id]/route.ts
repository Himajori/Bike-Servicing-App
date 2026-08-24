import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/auth";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { session, error } = await requireCustomer();
  if (!session) return NextResponse.json({ error }, { status: 401 });
  const { id } = await context.params;
  const prisma = await db();
  const bike = await prisma.bike.findFirst({
    where: { id, customerId: session.customerId! },
    include: { bookings: { where: { status: { notIn: ["COMPLETED", "CANCELLED"] } } } },
  });
  if (!bike) return NextResponse.json({ error: "Bike not found." }, { status: 404 });
  if (bike.bookings.length > 0) {
    return NextResponse.json({ error: "This bike has an open booking." }, { status: 409 });
  }
  await prisma.bike.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
