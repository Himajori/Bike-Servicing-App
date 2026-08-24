import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { estimatePrice } from "@/lib/pricing";

const schema = z.object({
  serviceId: z.string(),
  bikeId: z.string().optional(),
  mode: z.enum(["DOORSTEP", "PICKUP_DROP"]),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Need a service and mode." }, { status: 400 });
  }
  const prisma = await db();
  const service = await prisma.service.findUnique({ where: { id: parsed.data.serviceId } });
  if (!service) return NextResponse.json({ error: "Service not found." }, { status: 404 });
  let bikeYear: number | null = null;
  if (parsed.data.bikeId) {
    const bike = await prisma.bike.findUnique({ where: { id: parsed.data.bikeId } });
    bikeYear = bike?.year ?? null;
  }
  return NextResponse.json({
    quote: estimatePrice({ basePrice: service.basePrice, mode: parsed.data.mode, bikeYear }),
  });
}
