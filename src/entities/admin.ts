import type { User } from "./user";

/**
 * Admin — platform operator. Extends User (role = ADMIN).
 * Entity only for now. No admin screens yet.
 */
export interface Admin {
  id: string;
  userId: string;
}

export type AdminUser = User & {
  role: "ADMIN";
  admin: Admin;
};
