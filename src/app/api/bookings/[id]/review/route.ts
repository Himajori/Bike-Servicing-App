import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/auth";

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { session, error } = await requireCustomer();
  if (!session) return NextResponse.json({ error }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Choose a rating from 1 to 5." }, { status: 400 });
  }
  const { id } = await context.params;
  const prisma = await db();
  const booking = await prisma.booking.findFirst({
    where: { id, customerId: session.customerId! },
    include: { review: true, mechanic: true },
  });
  if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  if (booking.status !== "COMPLETED") {
    return NextResponse.json({ error: "You can review after the job is completed." }, { status: 409 });
  }
  if (!booking.mechanicId) {
    return NextResponse.json({ error: "No mechanic was assigned to this job." }, { status: 409 });
  }
  if (booking.review) {
    return NextResponse.json({ error: "You already reviewed this service." }, { status: 409 });
  }

  const review = await prisma.review.create({
    data: {
      bookingId: booking.id,
      customerId: session.customerId!,
      mechanicId: booking.mechanicId,
      rating: parsed.data.rating,
      comment: parsed.data.comment?.trim() || null,
    },
  });

  const agg = await prisma.review.aggregate({
    where: { mechanicId: booking.mechanicId },
    _avg: { rating: true },
    _count: { rating: true },
  });
  await prisma.mechanic.update({
    where: { id: booking.mechanicId },
    data: {
      rating: Number((agg._avg.rating ?? parsed.data.rating).toFixed(2)),
      reviewCount: agg._count.rating,
    },
  });

  return NextResponse.json({ review });
}
