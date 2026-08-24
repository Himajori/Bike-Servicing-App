import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function seedIfEmpty() {
  const existing = await prisma.user.count();
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
}
