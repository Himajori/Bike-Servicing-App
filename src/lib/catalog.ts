/**
 * Workshop catalog in euros, anchored to Albanian shop rates.
 * BikeTirana publishes quick fixes from €5 and a full service from €25.
 * Other listed shops in Tirana / Shkodër / Durrës typically sit in these bands.
 */
export type CatalogService = {
  name: string;
  description: string;
  category: string;
  priceMin: number;
  priceMax: number;
  basePrice: number;
  durationMin: number;
};

export const SERVICE_CATALOG: CatalogService[] = [
  {
    name: "Flat repair",
    description: "Tube or tubeless plug, inspect the tyre, inflate to spec. The usual €5–€12 street-shop job.",
    category: "Repair",
    priceMin: 5,
    priceMax: 12,
    basePrice: 8,
    durationMin: 25,
  },
  {
    name: "Safety check",
    description: "Headset, brakes, wheels, lights, and a go / no-go before a ride.",
    category: "Safety",
    priceMin: 8,
    priceMax: 18,
    basePrice: 12,
    durationMin: 35,
  },
  {
    name: "Chain & drivetrain clean",
    description: "Degrease, lube, and wipe the chain, cassette, and jockey wheels.",
    category: "Maintenance",
    priceMin: 10,
    priceMax: 18,
    basePrice: 14,
    durationMin: 40,
  },
  {
    name: "Gear indexing",
    description: "Limit screws, cable tension, and a quiet shift again.",
    category: "Repair",
    priceMin: 15,
    priceMax: 30,
    basePrice: 20,
    durationMin: 45,
  },
  {
    name: "Wheel true",
    description: "Lateral / radial true and spoke tension. Broken spokes extra.",
    category: "Repair",
    priceMin: 12,
    priceMax: 22,
    basePrice: 16,
    durationMin: 55,
  },
  {
    name: "Brake pads & setup",
    description: "New pads or blocks, alignment, and a firm lever. Cable or hydraulic.",
    category: "Repair",
    priceMin: 12,
    priceMax: 28,
    basePrice: 18,
    durationMin: 50,
  },
  {
    name: "Basic tune-up",
    description: "Gears, brakes, bolts, and a safety check. Everyday reset at most Albanian stands.",
    category: "Maintenance",
    priceMin: 15,
    priceMax: 35,
    basePrice: 22,
    durationMin: 60,
  },
  {
    name: "Hydraulic bleed",
    description: "Mineral oil or DOT bleed, lever feel, and a pad check.",
    category: "Repair",
    priceMin: 25,
    priceMax: 55,
    basePrice: 35,
    durationMin: 70,
  },
  {
    name: "Full service",
    description: "Drivetrain clean, bearings, wheels, cables. Albanian shops quote from about €25; a worn bike can reach €80.",
    category: "Maintenance",
    priceMin: 25,
    priceMax: 80,
    basePrice: 40,
    durationMin: 150,
  },
  {
    name: "E-bike diagnostic",
    description: "Battery, motor, and sensor readout with a written note. Dealer rates sit well above a city-shop tune.",
    category: "E-Bike",
    priceMin: 45,
    priceMax: 120,
    basePrice: 65,
    durationMin: 90,
  },
  {
    name: "Emergency callout",
    description: "Same-day roadside or doorstep fix when you cannot roll the bike in.",
    category: "Repair",
    priceMin: 20,
    priceMax: 45,
    basePrice: 28,
    durationMin: 40,
  },
];

export const SERVICE_RENAMES: Record<string, string> = {
  "Oil Change": "Chain & drivetrain clean",
  "Basic Tune-Up": "Basic tune-up",
  "Full Service": "Full service",
  "Brake Overhaul": "Brake pads & setup",
  "Gear Adjustment": "Gear indexing",
  "Wheel True & Spoke": "Wheel true",
  "E-Bike Diagnostic": "E-bike diagnostic",
  "Flat Repair": "Flat repair",
  "Safety Inspection": "Safety check",
};
