import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/auth";
import { nextStatus, statusNote } from "@/lib/booking-flow";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { session, error } = await requireCustomer();
  if (!session) return NextResponse.json({ error }, { status: 401 });
  const { id } = await context.params;
  const prisma = await db();
  const booking = await prisma.booking.findFirst({
    where: { id, customerId: session.customerId! },
  });
  if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  const upcoming = nextStatus(booking.status, booking.mode);
  if (!upcoming) {
    return NextResponse.json({ error: "This booking is already at a final status." }, { status: 409 });
  }
  const updated = await prisma.booking.update({
    where: { id },
    data: {
      status: upcoming,
      statusLogs: { create: { status: upcoming, note: statusNote(upcoming, booking.mode) } },
    },
    include: {
      service: true,
      bike: true,
      mechanic: { include: { user: { select: { name: true, phone: true } } } },
      payment: true,
      review: true,
      statusLogs: { orderBy: { createdAt: "asc" as const } },
    },
  });
  return NextResponse.json({ booking: updated });
}
