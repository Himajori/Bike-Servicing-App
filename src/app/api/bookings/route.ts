import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/auth";
import { cityFromQuery, estimatePrice } from "@/lib/pricing";
import { getSettings } from "@/lib/settings";
import { statusNote } from "@/lib/booking-flow";

const schema = z.object({
  serviceId: z.string(),
  bikeId: z.string(),
  mode: z.enum(["DOORSTEP", "PICKUP_DROP"]),
  scheduledAt: z.string(),
  address: z.string().min(4),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  notes: z.string().optional(),
  city: z.string().optional(),
});

const bookingInclude = {
  service: true,
  bike: true,
  mechanic: { include: { user: { select: { name: true, phone: true } } } },
  payment: true,
  review: true,
  statusLogs: { orderBy: { createdAt: "asc" as const } },
};

export async function GET() {
  const { session, error } = await requireCustomer();
  if (!session) return NextResponse.json({ error }, { status: 401 });
  const prisma = await db();
  const bookings = await prisma.booking.findMany({
    where: { customerId: session.customerId! },
    include: bookingInclude,
    orderBy: { scheduledAt: "desc" },
  });
  return NextResponse.json({ bookings });
}

export async function POST(request: Request) {
  const { session, error } = await requireCustomer();
  if (!session) return NextResponse.json({ error }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Choose a bike, slot, location, and service mode." }, { status: 400 });
  }

  const scheduledAt = new Date(parsed.data.scheduledAt);
  if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() < Date.now() - 60_000) {
    return NextResponse.json({ error: "Pick a date and time in the future." }, { status: 400 });
  }

  const prisma = await db();
  const [service, bike] = await Promise.all([
    prisma.service.findUnique({ where: { id: parsed.data.serviceId } }),
    prisma.bike.findFirst({ where: { id: parsed.data.bikeId, customerId: session.customerId! } }),
  ]);
  if (!service) return NextResponse.json({ error: "That service is not available." }, { status: 404 });
  if (!bike) return NextResponse.json({ error: "Add or choose one of your bikes." }, { status: 400 });

  const city = cityFromQuery(parsed.data.city);
  const price = estimatePrice({
    basePrice: service.basePrice,
    mode: parsed.data.mode,
    bikeYear: bike.year,
    fees: getSettings(),
    priceIndex: city?.priceIndex ?? 1,
  });

  const booking = await prisma.booking.create({
    data: {
      customerId: session.customerId!,
      mechanicId: null,
      bikeId: bike.id,
      serviceId: service.id,
      mode: parsed.data.mode,
      scheduledAt,
      status: "REQUESTED",
      address: parsed.data.address.trim(),
      lat: parsed.data.lat ?? null,
      lng: parsed.data.lng ?? null,
      estimatedPrice: price.total,
      notes: parsed.data.notes?.trim() || null,
      payment: {
        create: { customerId: session.customerId!, amount: price.total, status: "UNPAID" },
      },
      statusLogs: {
        create: [{ status: "REQUESTED", note: statusNote("REQUESTED", parsed.data.mode) }],
      },
    },
    include: bookingInclude,
  });

  const { notify } = await import("@/lib/notify");
  await notify(session.id, "Booking created", `${service.name} is booked.`);
  const pool = await prisma.mechanic.findMany({ include: { user: true } });
  for (const m of pool) {
    await notify(m.userId, "New service request", `${service.name} from ${session.name}.`);
  }

  return NextResponse.json({ booking, price });
}
