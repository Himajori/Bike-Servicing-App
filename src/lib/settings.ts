import { readFileSync, writeFileSync } from "fs";
import path from "path";

export type AppSettings = {
  workshopName: string;
  supportEmail: string;
  doorstepTravel: number;
  pickupTravel: number;
  ageSurcharge: number;
};

const FILE = path.join(process.cwd(), "data/settings.json");

const FALLBACK: AppSettings = {
  workshopName: "BikeService Lamar",
  supportEmail: "hello@bikeservice.test",
  doorstepTravel: 8,
  pickupTravel: 18,
  ageSurcharge: 12,
};

export function getSettings(): AppSettings {
  try {
    const raw = JSON.parse(readFileSync(FILE, "utf8")) as Partial<AppSettings>;
    return { ...FALLBACK, ...raw };
  } catch {
    return FALLBACK;
  }
}

export function saveSettings(next: AppSettings) {
  writeFileSync(FILE, `${JSON.stringify(next, null, 2)}\n`);
}
