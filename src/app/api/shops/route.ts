import { NextResponse } from "next/server";
import { cityBySlug, nearestCity, SERVICE_CITIES } from "@/lib/maps";
import { shopsForCity } from "@/lib/osm";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("city");
  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));
  const city =
    cityBySlug(slug) ??
    (Number.isFinite(lat) && Number.isFinite(lng) ? nearestCity(lat, lng).city : SERVICE_CITIES[0]);

  const result = await shopsForCity(city);
  const workshops = result.shops.map((shop) => ({
    id: shop.id,
    name: shop.name,
    address: shop.address || `${city.name}, ${city.country}`,
    lat: shop.lat,
    lng: shop.lng,
    services: shop.kind === "repair_station" ? "Public repair stand" : "Bicycle shop · repairs",
    phone: shop.phone ?? null,
    website: shop.website ?? null,
    openingHours: shop.openingHours ?? null,
    kind: shop.kind,
  }));

  return NextResponse.json({
    city: { slug: city.slug, name: city.name, country: city.country, priceIndex: city.priceIndex },
    source: result.source,
    live: result.live,
    count: workshops.length,
    workshops,
  });
}
