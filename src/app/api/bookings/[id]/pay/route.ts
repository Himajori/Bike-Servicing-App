import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/auth";

const schema = z.object({
  method: z.enum(["card", "upi", "wallet"]),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { session, error } = await requireCustomer();
  if (!session) return NextResponse.json({ error }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Choose a payment method." }, { status: 400 });
  }
  const { id } = await context.params;
  const prisma = await db();
  const booking = await prisma.booking.findFirst({
    where: { id, customerId: session.customerId! },
    include: { payment: true },
  });
  if (!booking?.payment) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  if (booking.payment.status === "PAID") {
    return NextResponse.json({ error: "Already paid." }, { status: 409 });
  }
  const payment = await prisma.payment.update({
    where: { id: booking.payment.id },
    data: { status: "PAID", method: parsed.data.method, paidAt: new Date() },
  });
  return NextResponse.json({ payment });
}
