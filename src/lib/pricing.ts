import type { ServiceMode } from "@prisma/client";

export type TravelFees = {
  doorstepTravel: number;
  pickupTravel: number;
  ageSurcharge: number;
};

const DEFAULT_FEES: TravelFees = {
  doorstepTravel: 8,
  pickupTravel: 18,
  ageSurcharge: 12,
};

export function estimatePrice(input: {
  basePrice: number;
  mode: ServiceMode;
  bikeYear: number | null;
  fees?: TravelFees;
}) {
  const fees = input.fees ?? DEFAULT_FEES;
  const travel = input.mode === "PICKUP_DROP" ? fees.pickupTravel : fees.doorstepTravel;
  const ageSurcharge =
    input.bikeYear && new Date().getFullYear() - input.bikeYear >= 10 ? fees.ageSurcharge : 0;
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
