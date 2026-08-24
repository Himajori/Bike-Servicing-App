import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { seedDatabase } from "../src/lib/seed-data";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.service.count();
  if (count > 0) {
    console.log("Database already seeded.");
    return;
  }
  await seedDatabase();
  console.log("Seeded BikeApp demo data. Customer login: alex@rideready.test / ride1234");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
