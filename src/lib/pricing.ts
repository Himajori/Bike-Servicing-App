import type { ServiceMode } from "@prisma/client";
import { cityBySlug, type ServiceCity } from "./maps";

export type TravelFees = {
  doorstepTravel: number;
  pickupTravel: number;
  ageSurcharge: number;
};

const DEFAULT_FEES: TravelFees = {
  doorstepTravel: 4,
  pickupTravel: 9,
  ageSurcharge: 6,
};

/** Lek per euro — Bank of Albania typically sits near 100 ALL / €1. */
export const ALL_PER_EUR = 100;

export function scalePrice(amount: number, index: number) {
  return Math.round(amount * index * 100) / 100;
}

export function estimatePrice(input: {
  basePrice: number;
  mode: ServiceMode;
  bikeYear: number | null;
  fees?: TravelFees;
  priceIndex?: number;
}) {
  const fees = input.fees ?? DEFAULT_FEES;
  const index = input.priceIndex ?? 1;
  const travel = (input.mode === "PICKUP_DROP" ? fees.pickupTravel : fees.doorstepTravel) * index;
  const ageSurcharge =
    input.bikeYear && new Date().getFullYear() - input.bikeYear >= 10 ? fees.ageSurcharge * index : 0;
  const basePrice = input.basePrice * index;
  const total = Math.round((basePrice + travel + ageSurcharge) * 100) / 100;
  return {
    basePrice: Math.round(basePrice * 100) / 100,
    travel: Math.round(travel * 100) / 100,
    ageSurcharge: Math.round(ageSurcharge * 100) / 100,
    total,
  };
}

export function formatMoney(amount: number, currency: "EUR" | "USD" = "EUR") {
  return new Intl.NumberFormat(currency === "EUR" ? "en-IE" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function formatLek(eur: number) {
  return `${Math.round(eur * ALL_PER_EUR).toLocaleString("en-US")} Lek`;
}

export function formatPriceRange(min: number, max: number, city?: ServiceCity | null) {
  const index = city?.priceIndex ?? 1;
  const lo = scalePrice(min, index);
  const hi = scalePrice(max, index);
  const euro = lo === hi ? formatMoney(lo) : `${formatMoney(lo)} – ${formatMoney(hi)}`;
  if (city?.countryCode === "AL") {
    return lo === hi ? `${euro} · ${formatLek(lo)}` : `${euro} · ${formatLek(lo)}–${formatLek(hi)}`;
  }
  if (city?.currency === "USD") {
    const usdLo = scalePrice(lo * 1.08, 1);
    const usdHi = scalePrice(hi * 1.08, 1);
    return `${euro} · ${formatMoney(usdLo, "USD")}–${formatMoney(usdHi, "USD")}`;
  }
  return euro;
}

export function pricedForCity<T extends { basePrice: number; priceMin?: number | null; priceMax?: number | null }>(
  service: T,
  city?: ServiceCity | null,
) {
  const index = city?.priceIndex ?? 1;
  const min = service.priceMin && service.priceMin > 0 ? service.priceMin : service.basePrice;
  const max = service.priceMax && service.priceMax > 0 ? service.priceMax : service.basePrice;
  return {
    ...service,
    basePrice: scalePrice(service.basePrice, index),
    priceMin: scalePrice(min, index),
    priceMax: scalePrice(max, index),
    priceIndex: index,
    citySlug: city?.slug ?? null,
    cityName: city?.name ?? null,
  };
}

export function cityFromQuery(slug: string | null | undefined) {
  return cityBySlug(slug) ?? cityBySlug("tirana");
}
