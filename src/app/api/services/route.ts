import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cityFromQuery, pricedForCity } from "@/lib/pricing";

export async function GET(request: Request) {
  const city = cityFromQuery(new URL(request.url).searchParams.get("city"));
  const prisma = await db();
  const rows = await prisma.service.findMany();
  const services = rows
    .map((service) => pricedForCity(service, city))
    .sort((a, b) => a.priceMin - b.priceMin || a.basePrice - b.basePrice);
  return NextResponse.json({
    city: { slug: city?.slug, name: city?.name, country: city?.country, priceIndex: city?.priceIndex },
    services,
  });
}
