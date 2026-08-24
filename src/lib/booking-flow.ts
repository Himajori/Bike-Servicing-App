import type { BookingStatus, ServiceMode } from "@prisma/client";

export const STATUS_LABELS: Record<BookingStatus, string> = {
  REQUESTED: "Requested",
  CONFIRMED: "Confirmed",
  MECHANIC_ASSIGNED: "Mechanic assigned",
  EN_ROUTE: "On the way",
  IN_PROGRESS: "In the stand",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function nextStatus(status: BookingStatus, mode: ServiceMode): BookingStatus | null {
  const doorstep: BookingStatus[] = [
    "REQUESTED",
    "CONFIRMED",
    "MECHANIC_ASSIGNED",
    "EN_ROUTE",
    "IN_PROGRESS",
    "READY",
    "COMPLETED",
  ];
  const pickup: BookingStatus[] = [
    "REQUESTED",
    "CONFIRMED",
    "MECHANIC_ASSIGNED",
    "EN_ROUTE",
    "IN_PROGRESS",
    "READY",
    "COMPLETED",
  ];
  const chain = mode === "PICKUP_DROP" ? pickup : doorstep;
  const index = chain.indexOf(status);
  if (index === -1 || index === chain.length - 1) return null;
  return chain[index + 1] ?? null;
}

export function statusNote(status: BookingStatus, mode: ServiceMode) {
  const pickup = mode === "PICKUP_DROP";
  switch (status) {
    case "REQUESTED":
      return "We received your booking.";
    case "CONFIRMED":
      return "The workshop confirmed your slot.";
    case "MECHANIC_ASSIGNED":
      return "A mechanic is assigned to your bike.";
    case "EN_ROUTE":
      return pickup
        ? "The van is heading to your address for pickup."
        : "Your mechanic is heading to your doorstep.";
    case "IN_PROGRESS":
      return pickup
        ? "Your bike is on the stand at the workshop."
        : "Work is underway at your location.";
    case "READY":
      return pickup
        ? "Service is done. Ready for drop-off."
        : "Service is done. Ready for a final check.";
    case "COMPLETED":
      return "Job closed. Thanks for booking with BikeApp.";
    case "CANCELLED":
      return "This booking was cancelled.";
  }
}
