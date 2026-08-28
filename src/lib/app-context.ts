import { db } from "./db";
import { haversineKm } from "./geo";
import { cityBySlug, SERVICE_CITIES, type ServiceCity } from "./maps";
import { albaniaShopsForCity, shopsForCity, type OsmShop } from "./osm";
import { pricedForCity } from "./pricing";
import { getSettings } from "./settings";

export type ShopSuggestion = {
  name: string;
  address: string;
  kind: "shop" | "repair_station";
  km: number;
  phone: string | null;
  website: string | null;
  lat: number;
  lng: number;
};

export type ServiceSummary = {
  name: string;
  category: string;
  priceMin: number;
  priceMax: number;
  typical: number;
  durationMin: number;
};

export type ListingSummary = {
  brand: string;
  model: string;
  year: number | null;
  price: number;
  city: string;
  description: string;
  seller: string;
  contact: string;
};

export type AppContext = {
  city: ServiceCity;
  services: ServiceSummary[];
  shops: ShopSuggestion[];
  listings: ListingSummary[];
  cities: string[];
  travel: { doorstep: number; pickup: number; ageSurcharge: number };
};

/** Named, contactable shops rank above unnamed pins; then closest to the centre. */
function rankShops(shops: OsmShop[], city: ServiceCity, limit = 8): ShopSuggestion[] {
  const generic = /^(bicycle repair|bike shop|bicycle service|bicycle|riparim|servis)/i;
  return shops
    .map((shop) => ({
      shop,
      km: haversineKm({ lat: shop.lat, lng: shop.lng }, city.center),
      named: shop.name && !generic.test(shop.name) ? 1 : 0,
      contactable: shop.phone || shop.website ? 1 : 0,
    }))
    .sort(
      (a, b) =>
        b.named - a.named || b.contactable - a.contactable || a.km - b.km,
    )
    .slice(0, limit)
    .map(({ shop, km }) => ({
      name: shop.name,
      address: shop.address || `${city.name}, ${city.country}`,
      kind: shop.kind,
      km: Math.round(km * 10) / 10,
      phone: shop.phone ?? null,
      website: shop.website ?? null,
      lat: shop.lat,
      lng: shop.lng,
    }));
}

export async function buildAppContext(citySlug?: string | null): Promise<AppContext> {
  const city = cityBySlug(citySlug) ?? SERVICE_CITIES[0];
  const prisma = await db();

  const [serviceRows, listingRows] = await Promise.all([
    prisma.service.findMany(),
    prisma.bikeListing.findMany({ where: { status: "FOR_SALE" }, orderBy: { price: "asc" }, take: 12 }),
  ]);

  const services: ServiceSummary[] = serviceRows
    .map((row) => pricedForCity(row, city))
    .sort((a, b) => a.priceMin - b.priceMin)
    .map((row) => ({
      name: row.name,
      category: row.category,
      priceMin: row.priceMin,
      priceMax: row.priceMax,
      typical: row.basePrice,
      durationMin: row.durationMin,
    }));

  // The Albania snapshot is local, so it never blocks a chat reply.
  let shops: OsmShop[] = city.countryCode === "AL" ? albaniaShopsForCity(city) : [];
  if (shops.length === 0) {
    shops = (await shopsForCity(city)).shops;
  }

  const fees = getSettings();
  const index = city.priceIndex;

  return {
    city,
    services,
    shops: rankShops(shops, city),
    listings: listingRows.map((row) => ({
      brand: row.brand,
      model: row.model,
      year: row.year,
      price: row.price,
      city: row.city,
      description: row.description,
      seller: row.sellerName,
      contact: row.sellerPhone ?? row.sellerEmail,
    })),
    cities: SERVICE_CITIES.map((item) => item.name),
    travel: {
      doorstep: Math.round(fees.doorstepTravel * index * 100) / 100,
      pickup: Math.round(fees.pickupTravel * index * 100) / 100,
      ageSurcharge: Math.round(fees.ageSurcharge * index * 100) / 100,
    },
  };
}
