import type { User } from "./user";

/**
 * Customer — a bike owner.
 *
 * Can: create an account / log in, add bikes, view and choose a service,
 * pick a date and time, choose doorstep or pickup & drop, see the
 * estimated price, track status, view history, pay, and review.
 */
export interface Customer {
  id: string;
  userId: string;
  address: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
}

export type CustomerUser = User & {
  role: "CUSTOMER";
  customer: Customer;
};
