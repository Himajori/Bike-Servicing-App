export const PAYMENT_STATUSES = ["UNPAID", "PAID", "REFUNDED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/**
 * Payment — settlement for a completed (or upcoming) booking.
 */
export interface Payment {
  id: string;
  bookingId: string;
  customerId: string;
  amount: number;
  status: PaymentStatus;
  method: string | null;
  paidAt: Date | null;
}
