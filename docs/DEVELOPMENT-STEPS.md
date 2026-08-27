# BikeService — 17 development steps

This repo follows the build plan from the BikeService UI (customer app, mechanic app, admin dashboard).

| Step | What | Where |
| --- | --- | --- |
| 1 | Requirements | This file |
| 2 | Architecture | Next.js UI + Route Handlers + Prisma SQL |
| 3 | Database | `prisma/schema.prisma` |
| 4 | Create project | Next.js + TypeScript |
| 5 | Registration / login | `/register`, `/login`, `/api/auth/*` |
| 6 | Customer profile | `/account` |
| 7 | Bike management | `/bikes`, `/api/bikes` |
| 8 | Service catalog | `/services`, `/api/services` |
| 9 | Booking | `/book/[id]`, `/api/bookings` |
| 10 | Mechanic dashboard | `/mechanic`, `/api/mechanic/jobs` |
| 11 | Booking status | Customer track + mechanic advance |
| 12 | Inventory | `/admin/inventory`, parts on complete job |
| 13 | Pickup & delivery | Booking `mode`: DOORSTEP or PICKUP_DROP |
| 14 | Payments | Card / UPI / wallet on the job |
| 15 | Reviews | Stars + comment after complete |
| 16 | Notifications | `/api/notifications` in-app alerts |
| 17 | Admin dashboard | `/admin` KPIs, users, bookings, inventory |

## Roles

- **Customer** — book and track service (`alex@rideready.test`)
- **Mechanic** — accept jobs, update status, use parts (`maya@rideready.test`)
- **Admin** — platform dashboard (`admin@rideready.test`)

Password for all demo users: `ride1234`
