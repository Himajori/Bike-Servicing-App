/**
 * Service — a bookable workshop job with a base price and duration.
 */
export interface ServiceCatalogItem {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  durationMin: number;
}
