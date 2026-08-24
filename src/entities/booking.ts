export const SERVICE_MODES = ["DOORSTEP", "PICKUP_DROP"] as const;
export type ServiceMode = (typeof SERVICE_MODES)[number];

export const BOOKING_STATUSES = [
  "REQUESTED",
  "CONFIRMED",
  "MECHANIC_ASSIGNED",
  "EN_ROUTE",
  "IN_PROGRESS",
  "READY",
  "COMPLETED",
  "CANCELLED",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

/**
 * Booking — a scheduled service job for one bike.
 */
export interface Booking {
  id: string;
  customerId: string;
  mechanicId: string | null;
  bikeId: string;
  serviceId: string;
  mode: ServiceMode;
  scheduledAt: Date;
  status: BookingStatus;
  address: string;
  lat: number | null;
  lng: number | null;
  estimatedPrice: number;
  notes: string | null;
  createdAt: Date;
}

export interface StatusLog {
  id: string;
  bookingId: string;
  status: BookingStatus;
  note: string | null;
  createdAt: Date;
}
