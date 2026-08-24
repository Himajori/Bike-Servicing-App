/**
 * Review — customer rating of the assigned mechanic / job.
 */
export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  mechanicId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
}
