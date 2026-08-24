/**
 * Bike — a customer's bicycle, used when booking a service.
 */
export interface Bike {
  id: string;
  customerId: string;
  brand: string;
  model: string;
  year: number | null;
  registration: string | null;
  color: string | null;
  createdAt: Date;
}
