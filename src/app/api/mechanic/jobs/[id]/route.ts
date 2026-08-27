import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireMechanic } from "@/lib/auth";
import { nextStatus, statusNote } from "@/lib/booking-flow";
import { notify } from "@/lib/notify";

const schema = z.object({
  action: z.enum(["accept", "reject", "advance", "complete"]),
  workSummary: z.string().optional(),
  parts: z
    .array(
      z.object({
        inventoryItemId: z.string(),
        quantity: z.number().int().min(1),
      }),
    )
    .optional(),
});

const include = {
  service: true,
  bike: true,
  customer: { include: { user: { select: { name: true, phone: true, id: true } } } },
  payment: true,
  parts: { include: { inventoryItem: true } },
  statusLogs: { orderBy: { createdAt: "asc" as const } },
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { session, error } = await requireMechanic();
  if (!session) return NextResponse.json({ error }, { status: 401 });
  const { id } = await context.params;
  const prisma = await db();
  const job = await prisma.booking.findFirst({
    where: { id, OR: [{ mechanicId: session.mechanicId! }, { mechanicId: null }] },
    include,
  });
  if (!job) return NextResponse.json({ error: "Job not found." }, { status: 404 });
  return NextResponse.json({ job });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { session, error } = await requireMechanic();
  if (!session) return NextResponse.json({ error }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  const { id } = await context.params;
  const prisma = await db();
  const job = await prisma.booking.findUnique({
    where: { id },
    include: { customer: { include: { user: true } } },
  });
  if (!job) return NextResponse.json({ error: "Job not found." }, { status: 404 });

  if (parsed.data.action === "accept") {
    const updated = await prisma.booking.update({
      where: { id },
      data: {
        mechanicId: session.mechanicId!,
        status: "MECHANIC_ASSIGNED",
        statusLogs: { create: { status: "MECHANIC_ASSIGNED", note: "Mechanic accepted the job." } },
      },
      include,
    });
    await notify(job.customer.userId, "Mechanic assigned", `${session.name} accepted your booking.`);
    return NextResponse.json({ job: updated });
  }

  if (parsed.data.action === "reject") {
    if (job.mechanicId && job.mechanicId !== session.mechanicId) {
      return NextResponse.json({ error: "Not your job." }, { status: 403 });
    }
    const updated = await prisma.booking.update({
      where: { id },
      data: { mechanicId: null, status: "REQUESTED" },
      include,
    });
    return NextResponse.json({ job: updated });
  }

  if (job.mechanicId !== session.mechanicId) {
    return NextResponse.json({ error: "Not your job." }, { status: 403 });
  }

  if (parsed.data.action === "advance") {
    const upcoming = nextStatus(job.status, job.mode);
    if (!upcoming || upcoming === "COMPLETED") {
      return NextResponse.json({ error: "Use complete for the last step." }, { status: 409 });
    }
    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: upcoming,
        statusLogs: { create: { status: upcoming, note: statusNote(upcoming, job.mode) } },
      },
      include,
    });
    await notify(job.customer.userId, "Status update", statusNote(upcoming, job.mode));
    return NextResponse.json({ job: updated });
  }

  const parts = parsed.data.parts ?? [];
  for (const part of parts) {
    const item = await prisma.inventoryItem.findUnique({ where: { id: part.inventoryItemId } });
    if (!item || item.quantity < part.quantity) {
      return NextResponse.json({ error: `Not enough stock for ${item?.name ?? "a part"}.` }, { status: 409 });
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.bookingPart.deleteMany({ where: { bookingId: id } });
    for (const part of parts) {
      const item = await tx.inventoryItem.findUnique({ where: { id: part.inventoryItemId } });
      if (!item) continue;
      await tx.bookingPart.create({
        data: {
          bookingId: id,
          inventoryItemId: item.id,
          quantity: part.quantity,
          unitPrice: item.unitPrice,
        },
      });
      await tx.inventoryItem.update({
        where: { id: item.id },
        data: { quantity: { decrement: part.quantity } },
      });
    }
    await tx.booking.update({
      where: { id },
      data: {
        status: "COMPLETED",
        workSummary: parsed.data.workSummary?.trim() || "Service completed.",
        statusLogs: { create: { status: "COMPLETED", note: "Mechanic completed the job." } },
      },
    });
  });

  await notify(job.customer.userId, "Service completed", "Your bike is ready. Pay and leave a review.");
  const updated = await prisma.booking.findUnique({ where: { id }, include });
  return NextResponse.json({ job: updated });
}
