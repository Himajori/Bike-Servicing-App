import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const prisma = await db();
  const mechanics = await prisma.mechanic.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { rating: "desc" },
  });
  return NextResponse.json({
    mechanics: mechanics.map((m) => ({
      id: m.id,
      name: m.user.name,
      specialty: m.specialty,
      rating: m.rating,
      reviewCount: m.reviewCount,
      experienceYears: m.experienceYears,
      lat: m.lat,
      lng: m.lng,
      available: m.available,
    })),
  });
}
