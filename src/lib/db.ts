import { prisma } from "./prisma";
import { seedIfEmpty } from "./seed-data";

export { prisma };

let seedPromise: Promise<void> | null = null;

export async function db() {
  if (!seedPromise) {
    seedPromise = seedIfEmpty().catch((error) => {
      seedPromise = null;
      console.error("Seed failed", error);
      throw error;
    });
  }
  await seedPromise;
  return prisma;
}
