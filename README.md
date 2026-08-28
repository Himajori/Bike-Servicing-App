# BikeService

Doorstep and pickup bike repair, with a GPS map of real **Albanian bicycle shops** (OpenStreetMap) and a price list from **lowest to highest**.

Customers book jobs, track status, pay, and review. Mechanics accept work and log parts. Admins see KPIs, users, bookings, and inventory.

GitHub: [https://github.com/Himajori/Bike-Servicing-App](https://github.com/Himajori/Bike-Servicing-App)

The 17-step plan is in [docs/DEVELOPMENT-STEPS.md](docs/DEVELOPMENT-STEPS.md). UI reference: [docs/design-bikeservice.png](docs/design-bikeservice.png).

## What you can do

| Role | Screens |
| --- | --- |
| Customer | Home, bikes, services, book date/time, track, pay, review, alerts |
| Mechanic | New / accepted / completed jobs, job details, progress, parts, earnings |
| Admin | Dashboard KPIs, users, bookings, inventory, services, payments, reviews, reports, settings |

Landing: **Use my GPS** or search a city. Tirana is default. The map loads OpenStreetMap `shop=bicycle` and repair stands (about 99 in Albania). Other countries use the same Overpass query inside that city's GPS box.

Prices are euro bands from Albanian shop rates (quick fixes from €5, full service from €25), shown with lek in Albania, then scaled for Kosovo, Greece, Italy, Poland, and the US.

## How it works

```
Browser (Next.js pages)
        │
        ▼
API routes in src/app/api/...
        │
        ▼
Prisma + SQLite
OpenStreetMap / Overpass for shop GPS
        │
        ▼
User → Customer | Mechanic | Admin
Bike, Service, Booking, Payment, Review
InventoryItem, BookingPart, Notification
```

1. Sign-in stores a signed cookie (`src/lib/auth.ts`). Login routes by role: `/home`, `/mechanic`, `/admin`.
2. A booking stays **requested** until a mechanic accepts it.
3. Status then moves assigned → on the way → in progress → ready → completed.
4. Completing a job can deduct inventory and add parts to the bill.
5. Payment marks the SQL `Payment` row as `PAID` (demo — no live processor).
6. Notifications are written on booking and status changes.

TypeScript domain types live in `src/entities/`. The SQL schema is `prisma/schema.prisma`. phpMyAdmin import: `prisma/mysql-schema.sql`.

## Screens

Landing and account:

![Landing](docs/screenshots/01-landing.png)

![Login](docs/screenshots/02-login.png)

![Register](docs/screenshots/03-register.png)

Home, bikes, and catalog:

![Home](docs/screenshots/04-home.png)

![Bikes](docs/screenshots/05-bikes.png)

![Services](docs/screenshots/06-services.png)

Book, history, track / pay / review:

![Book a service](docs/screenshots/07-book.png)

![Service history](docs/screenshots/08-history.png)

![Track, pay, review](docs/screenshots/09-track-pay-review.png)

![Account](docs/screenshots/10-account.png)

## Run locally

```bash
npm install
cp .env.example .env
npx prisma migrate deploy
npx prisma generate
npm run dev
```

Open [http://127.0.0.1:43217](http://127.0.0.1:43217).

Demo password for all roles: `ride1234`

| Role | Email | After login |
| --- | --- | --- |
| Customer | alex@rideready.test | `/home` |
| Mechanic | maya@rideready.test | `/mechanic` |
| Admin | admin@rideready.test | `/admin` |
