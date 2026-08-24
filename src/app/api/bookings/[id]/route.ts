import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/auth";

const bookingInclude = {
  service: true,
  bike: true,
  mechanic: { include: { user: { select: { name: true, phone: true } } } },
  payment: true,
  review: true,
  statusLogs: { orderBy: { createdAt: "asc" as const } },
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { session, error } = await requireCustomer();
  if (!session) return NextResponse.json({ error }, { status: 401 });
  const { id } = await context.params;
  const prisma = await db();
  const booking = await prisma.booking.findFirst({
    where: { id, customerId: session.customerId! },
    include: bookingInclude,
  });
  if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  return NextResponse.json({ booking });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { session, error } = await requireCustomer();
  if (!session) return NextResponse.json({ error }, { status: 401 });
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as { action?: string } | null;
  if (body?.action !== "cancel") {
    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  }
  const prisma = await db();
  const booking = await prisma.booking.findFirst({
    where: { id, customerId: session.customerId! },
  });
  if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  if (["COMPLETED", "CANCELLED", "IN_PROGRESS", "READY"].includes(booking.status)) {
    return NextResponse.json({ error: "This booking can no longer be cancelled." }, { status: 409 });
  }
  const updated = await prisma.booking.update({
    where: { id },
    data: {
      status: "CANCELLED",
      statusLogs: { create: { status: "CANCELLED", note: "Cancelled by the customer." } },
    },
    include: bookingInclude,
  });
  return NextResponse.json({ booking: updated });
}
