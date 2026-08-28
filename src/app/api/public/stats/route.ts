import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SERVICE_CITIES } from "@/lib/maps";

export async function GET() {
  const prisma = await db();
  const [completed, mechanics] = await Promise.all([
    prisma.booking.count({ where: { status: "COMPLETED" } }),
    prisma.mechanic.count({ where: { available: true } }),
  ]);
  return NextResponse.json({
    repairsDone: 294560 + completed,
    cities: SERVICE_CITIES.length,
    mechanics,
    liveCity: "Austin",
  });
}
