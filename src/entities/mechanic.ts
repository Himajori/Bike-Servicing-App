import type { User } from "./user";

/**
 * Mechanic — a service provider. Extends User (role = MECHANIC).
 * Entity for later staff screens. Assigned onto customer bookings today.
 */
export interface Mechanic {
  id: string;
  userId: string;
  specialty: string | null;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  lat: number | null;
  lng: number | null;
  available: boolean;
}

export type MechanicUser = User & {
  role: "MECHANIC";
  mechanic: Mechanic;
};
