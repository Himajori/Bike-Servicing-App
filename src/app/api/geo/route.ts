import { NextResponse } from "next/server";
import { z } from "zod";
import { cityMatchesQuery, nearestCity, SERVICE_CITIES } from "@/lib/maps";
import { haversineKm } from "@/lib/geo";

const schema = z.object({
  lat: z.number().gte(-90).lte(90),
  lng: z.number().gte(-180).lte(180),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Need GPS coordinates." }, { status: 400 });
  }

  const { lat, lng } = parsed.data;
  const nearest = nearestCity(lat, lng);

  let label: string | null = null;
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("zoom", "14");
    const response = await fetch(url, {
      headers: { "User-Agent": "BikeService/1.0 (https://github.com/Himajori/Bike-Servicing-App)" },
      signal: AbortSignal.timeout(6000),
    });
    if (response.ok) {
      const geo = (await response.json()) as {
        display_name?: string;
        address?: { city?: string; town?: string; village?: string; country?: string };
      };
      label = geo.display_name ?? null;
      const named = geo.address?.city || geo.address?.town || geo.address?.village;
      if (named) {
        const match = SERVICE_CITIES.find(
          (city) => cityMatchesQuery(city, named) || named.toLowerCase().includes(city.name.toLowerCase()),
        );
        if (match) {
          return NextResponse.json({
            city: match,
            km: Math.round(haversineKm({ lat, lng }, match.center) * 10) / 10,
            label,
            lat,
            lng,
          });
        }
      }
    }
  } catch {
    /* OSM reverse is optional — nearest city still works. */
  }

  return NextResponse.json({
    city: nearest.city,
    km: nearest.km,
    label,
    lat,
    lng,
  });
}
