import type { ServiceMode } from "@prisma/client";

export function estimatePrice(input: {
  basePrice: number;
  mode: ServiceMode;
  bikeYear: number | null;
}) {
  const travel = input.mode === "PICKUP_DROP" ? 18 : 8;
  const ageSurcharge =
    input.bikeYear && new Date().getFullYear() - input.bikeYear >= 10 ? 12 : 0;
  const total = Math.round((input.basePrice + travel + ageSurcharge) * 100) / 100;
  return {
    basePrice: input.basePrice,
    travel,
    ageSurcharge,
    total,
  };
}

export function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
