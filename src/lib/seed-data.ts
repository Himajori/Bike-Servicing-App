import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { CITY } from "./maps";

const DEMO_PASSWORD = "ride1234";

export async function seedIfEmpty() {
  const existing = await prisma.service.count();
  if (existing === 0) await seedDatabase();
  if ((await prisma.inventoryItem.count()) === 0) {
    await prisma.inventoryItem.createMany({
      data: [
        { name: "Engine oil 10W-40", sku: "OIL-10W40", quantity: 24, unitPrice: 12.5 },
        { name: "Brake pads (pair)", sku: "BRK-PAD", quantity: 16, unitPrice: 28 },
        { name: "Inner tube 700x28", sku: "TUBE-700", quantity: 40, unitPrice: 8 },
        { name: "Chain lube", sku: "LUBE-01", quantity: 18, unitPrice: 9 },
      ],
    });
  }
}

export async function seedDatabase() {
  const password = await bcrypt.hash(DEMO_PASSWORD, 10);

  const services = await Promise.all(
    [
      {
        name: "Oil Change",
        description: "Engine oil and filter swap with a leak check.",
        category: "Maintenance",
        basePrice: 35,
        durationMin: 30,
      },
      {
        name: "Basic Tune-Up",
        description: "Gears, brakes, bolts, and a safety check. The everyday reset.",
        category: "Maintenance",
        basePrice: 49,
        durationMin: 60,
      },
      {
        name: "Full Service",
        description: "Drivetrain clean, bearing check, wheel true, and cable refresh.",
        category: "Maintenance",
        basePrice: 129,
        durationMin: 150,
      },
      {
        name: "Brake Overhaul",
        description: "Pads, alignment, and bleed or cable replacement as needed.",
        category: "Repair",
        basePrice: 79,
        durationMin: 75,
      },
      {
        name: "Gear Adjustment",
        description: "Indexing, limit screws, and a quiet, crisp shift again.",
        category: "Repair",
        basePrice: 45,
        durationMin: 45,
      },
      {
        name: "Wheel True & Spoke",
        description: "Lateral/radial true and tension balance. Broken spokes extra.",
        category: "Repair",
        basePrice: 59,
        durationMin: 60,
      },
      {
        name: "E-Bike Diagnostic",
        description: "Battery, motor, and sensor readout with a written report.",
        category: "E-Bike",
        basePrice: 89,
        durationMin: 90,
      },
      {
        name: "Flat Repair",
        description: "Tube or tubeless plug, inspect the tire, and inflate to spec.",
        category: "Repair",
        basePrice: 25,
        durationMin: 30,
      },
      {
        name: "Safety Inspection",
        description: "Pre-ride checklist: headset, brakes, wheels, and lights.",
        category: "Safety",
        basePrice: 35,
        durationMin: 40,
      },
    ].map((service) => prisma.service.create({ data: service })),
  );

  const alex = await prisma.user.create({
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
    include: { customer: true },
  });

  const maya = await prisma.user.create({
    data: {
      email: "maya@rideready.test",
      password,
      name: "Maya Chen",
      phone: "+1 512 555 0190",
      role: "MECHANIC",
      mechanic: {
        create: {
          specialty: "Drivetrain & road bikes",
          experienceYears: 8,
          rating: 4.9,
          reviewCount: 128,
          lat: 30.2691,
          lng: -97.7448,
          available: true,
        },
      },
    },
    include: { mechanic: true },
  });

  await prisma.user.create({
    data: {
      email: "luis@rideready.test",
      password,
      name: "Luis Ortega",
      phone: "+1 512 555 0172",
      role: "MECHANIC",
      mechanic: {
        create: {
          specialty: "E-bikes & cargo",
          experienceYears: 6,
          rating: 4.8,
          reviewCount: 94,
          lat: 30.2584,
          lng: -97.7611,
          available: true,
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      email: "priya@rideready.test",
      password,
      name: "Priya Shah",
      phone: "+1 512 555 0114",
      role: "MECHANIC",
      mechanic: {
        create: {
          specialty: "Wheels, brakes, commuters",
          experienceYears: 11,
          rating: 4.95,
          reviewCount: 210,
          lat: 30.2742,
          lng: -97.74,
          available: true,
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      email: "admin@rideready.test",
      password,
      name: "Jordan Hale",
      phone: "+1 512 555 0100",
      role: "ADMIN",
      admin: { create: {} },
    },
  });

  const customerId = alex.customer!.id;
  const trek = await prisma.bike.create({
    data: {
      customerId,
      brand: "Trek",
      model: "Domane AL 4",
      year: 2022,
      registration: "TX-AK-4421",
      color: "Juniper",
    },
  });

  const specialized = await prisma.bike.create({
    data: {
      customerId,
      brand: "Specialized",
      model: "Turbo Vado 4.0",
      year: 2023,
      registration: "TX-EV-1180",
      color: "Cast Black",
    },
  });

  const fullService = services.find((s) => s.name === "Full Service")!;
  const tuneUp = services.find((s) => s.name === "Basic Tune-Up")!;
  const flat = services.find((s) => s.name === "Flat Repair")!;

  const active = await prisma.booking.create({
    data: {
      customerId,
      mechanicId: maya.mechanic!.id,
      bikeId: trek.id,
      serviceId: fullService.id,
      mode: "DOORSTEP",
      scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 26),
      status: "EN_ROUTE",
      address: "1204 East 6th Street, Austin, TX",
      lat: 30.2643,
      lng: -97.7312,
      estimatedPrice: 137,
      notes: "Creak from the bottom bracket on climbs.",
      payment: {
        create: { customerId, amount: 137, status: "UNPAID" },
      },
      statusLogs: {
        create: [
          { status: "REQUESTED", note: "We received your booking.", createdAt: hoursAgo(30) },
          { status: "CONFIRMED", note: "The workshop confirmed your slot.", createdAt: hoursAgo(28) },
          {
            status: "MECHANIC_ASSIGNED",
            note: "Maya Chen is assigned to your bike.",
            createdAt: hoursAgo(20),
          },
          {
            status: "EN_ROUTE",
            note: "Your mechanic is heading to your doorstep.",
            createdAt: hoursAgo(1),
          },
        ],
      },
    },
  });
  void active;

  const done = await prisma.booking.create({
    data: {
      customerId,
      mechanicId: maya.mechanic!.id,
      bikeId: specialized.id,
      serviceId: tuneUp.id,
      mode: "PICKUP_DROP",
      scheduledAt: hoursAgo(96),
      status: "COMPLETED",
      address: CITY.workshop.address,
      lat: CITY.workshop.lat,
      lng: CITY.workshop.lng,
      estimatedPrice: 67,
      payment: {
        create: {
          customerId,
          amount: 67,
          status: "PAID",
          method: "card",
          paidAt: hoursAgo(90),
        },
      },
      review: {
        create: {
          customerId,
          mechanicId: maya.mechanic!.id,
          rating: 5,
          comment: "Quiet shifts and they texted before drop-off. Easy.",
        },
      },
      statusLogs: {
        create: [
          { status: "REQUESTED", createdAt: hoursAgo(120) },
          { status: "COMPLETED", note: "Job closed.", createdAt: hoursAgo(90) },
        ],
      },
    },
  });
  void done;

  await prisma.booking.create({
    data: {
      customerId,
      bikeId: trek.id,
      serviceId: flat.id,
      mode: "DOORSTEP",
      scheduledAt: hoursAgo(12),
      status: "COMPLETED",
      address: "1204 East 6th Street, Austin, TX",
      lat: 30.2643,
      lng: -97.7312,
      estimatedPrice: 33,
      payment: {
        create: { customerId, amount: 33, status: "UNPAID" },
      },
      statusLogs: {
        create: [
          { status: "REQUESTED", createdAt: hoursAgo(20) },
          { status: "COMPLETED", note: "Tube replaced, tire inspected.", createdAt: hoursAgo(12) },
        ],
      },
    },
  });

  await prisma.inventoryItem.createMany({
    data: [
      { name: "Engine oil 10W-40", sku: "OIL-10W40", quantity: 24, unitPrice: 12.5 },
      { name: "Brake pads (pair)", sku: "BRK-PAD", quantity: 16, unitPrice: 28 },
      { name: "Inner tube 700x28", sku: "TUBE-700", quantity: 40, unitPrice: 8 },
      { name: "Chain lube", sku: "LUBE-01", quantity: 18, unitPrice: 9 },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: alex.id,
        title: "Mechanic on the way",
        body: "Maya Chen is heading to East 6th for your Full Service.",
      },
      {
        userId: maya.id,
        title: "New doorstep job",
        body: "Full Service on a Trek Domane AL 4.",
      },
    ],
  });
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}
