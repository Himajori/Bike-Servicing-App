/**
 * User — base identity entity.
 *
 *   User
 *    ├── Customer
 *    ├── Mechanic
 *    └── Admin
 *
 * Only Customer is used in the app today.
 * Mechanic and Admin stay as entities for later.
 */

export const USER_ROLES = ["CUSTOMER", "MECHANIC", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface User {
  id: string;
  email: string;
  /** bcrypt hash — never sent to the client */
  password: string;
  name: string;
  phone: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type PublicUser = Omit<User, "password">;
