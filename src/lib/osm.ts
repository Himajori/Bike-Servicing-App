import albaniaShops from "@/data/osm-albania-shops.json";
import { pointInBounds } from "./geo";
import { type MapBounds, type ServiceCity } from "./maps";

export type OsmShop = {
  id: string;
  name: string;
  kind: "shop" | "repair_station";
  lat: number;
  lng: number;
  address: string | null;
  phone?: string | null;
  website?: string | null;
  openingHours?: string | null;
  city?: string;
  cityName?: string;
  source: "openstreetmap";
};

type CacheEntry = { at: number; shops: OsmShop[]; live: boolean };

const cache = new Map<string, CacheEntry>();
const CACHE_MS = 15 * 60 * 1000;
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const albania: OsmShop[] = (albaniaShops as Omit<OsmShop, "source">[]).map((shop) => ({
  ...shop,
  kind: shop.kind === "repair_station" ? "repair_station" : "shop",
  source: "openstreetmap",
}));

function toShop(element: {
  type?: string;
  id?: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}): OsmShop | null {
  const tags = element.tags ?? {};
  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;
  if (lat == null || lng == null) return null;
  const name = tags.name || tags["name:en"] || tags.brand || tags.operator || "Bicycle repair";
  const address = [tags["addr:street"], tags["addr:housenumber"], tags["addr:city"] || tags["addr:town"]]
    .filter(Boolean)
    .join(", ");
  return {
    id: `${element.type ?? "node"}/${element.id ?? `${lat},${lng}`}`,
    name,
    kind: tags.amenity === "bicycle_repair_station" ? "repair_station" : "shop",
    lat,
    lng,
    address: address || null,
    phone: tags.phone || tags["contact:phone"] || null,
    website: tags.website || tags["contact:website"] || null,
    openingHours: tags.opening_hours || null,
    source: "openstreetmap",
  };
}

async function overpass(bounds: MapBounds): Promise<OsmShop[]> {
  const bbox = `${bounds.minLat},${bounds.minLng},${bounds.maxLat},${bounds.maxLng}`;
  const data = `[out:json][timeout:18];(node["shop"="bicycle"](${bbox});way["shop"="bicycle"](${bbox});node["amenity"="bicycle_repair_station"](${bbox}););out center 80;`;
  const body = new URLSearchParams({ data });
  let lastError: unknown;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          "User-Agent": "BikeService/1.0 (https://github.com/Himajori/Bike-Servicing-App)",
        },
        body,
        signal: AbortSignal.timeout(8_000),
      });
      if (!response.ok) throw new Error(`Overpass ${response.status}`);
      const json = (await response.json()) as { elements?: Parameters<typeof toShop>[0][] };
      return (json.elements ?? []).map(toShop).filter((shop): shop is OsmShop => Boolean(shop));
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Overpass unavailable");
}

export function albaniaShopsForCity(city: ServiceCity): OsmShop[] {
  const bySlug = albania.filter((shop) => shop.city === city.slug);
  if (bySlug.length > 0) return bySlug;
  return albania.filter((shop) => pointInBounds(shop, city.bounds));
}

export async function shopsForCity(city: ServiceCity): Promise<{ shops: OsmShop[]; live: boolean; source: string }> {
  const hit = cache.get(city.slug);
  if (hit && Date.now() - hit.at < CACHE_MS) {
    return { shops: hit.shops, live: hit.live, source: hit.live ? "openstreetmap" : "cache" };
  }

  const albaniaFallback = city.countryCode === "AL" ? albaniaShopsForCity(city) : [];

  // Albania already has a full OSM snapshot — do not block the page on Overpass.
  if (albaniaFallback.length > 0) {
    cache.set(city.slug, { at: Date.now(), shops: albaniaFallback, live: false });
    return { shops: albaniaFallback, live: false, source: "openstreetmap-cache" };
  }

  try {
    const live = await overpass(city.bounds);
    const shops = live.length > 0 ? live : [];
    cache.set(city.slug, { at: Date.now(), shops, live: shops.length > 0 });
    return {
      shops,
      live: shops.length > 0,
      source: shops.length > 0 ? "openstreetmap" : "openstreetmap-cache",
    };
  } catch {
    cache.set(city.slug, { at: Date.now(), shops: [], live: false });
    return { shops: [], live: false, source: "openstreetmap-cache" };
  }
}

export { albania };
