import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function seedIfEmpty() {
  const existing = await prisma.service.count();
  if (existing > 0) return;
  const password = await bcrypt.hash("ride1234", 10);
  await prisma.user.create({
    data: {
      email: "alex@rideready.test",
      password,
      name: "Alex Rivera",
      phone: "+1 512 555 0148",
      role: "CUSTOMER",
      customer: {
        create: {
          address: "1204 East 6th Street, Austin, TX",
          city: "Austin",
          lat: 30.2643,
          lng: -97.7312,
        },
      },
    },
  });
  await prisma.service.createMany({
    data: [
      { name: "Basic Tune-Up", description: "Gears, brakes, bolts, and a safety check.", category: "Maintenance", basePrice: 49, durationMin: 60 },
      { name: "Full Service", description: "Drivetrain clean, bearing check, and wheel true.", category: "Maintenance", basePrice: 129, durationMin: 150 },
      { name: "Flat Repair", description: "Tube or tubeless plug and inflate to spec.", category: "Repair", basePrice: 25, durationMin: 30 },
    ],
  });
}
