# MED backend

Minimal Express, TypeScript, PostgreSQL and Prisma backend for the MED platform. The existing React frontend is in `../med-clinic`.

## Structure

```text
src/
  app.ts                 Express setup and route registration
  server.ts              Process startup and shutdown
  db.ts                  Prisma Client
  common/errors.ts       Shared HTTP error responses
  modules/doctors/
    doctors.routes.ts    HTTP handlers
    doctors.schema.ts    Request validation
    doctors.service.ts   Queries and business rules
prisma/
  schema.prisma          Database models
  migrations/            SQL migrations
  seed.ts                Repeatable sample data
```

New features follow the same small module pattern. Routes handle HTTP, schemas validate input, and services use Prisma directly. Add shared helpers only when several modules need them. Protected operations must check access to the specific patient or document.

## Local setup

Requires Node.js 22+ and PostgreSQL. Docker is optional.

1. Copy `.env.example` to `.env` and set the local PostgreSQL password in `DATABASE_URL`. Never commit `.env`.
2. Create an empty database named `med_clinic` if it does not already exist.
3. Run:

```powershell
npm install
npm run db:generate
npm run db:deploy
npm run db:seed
npm run dev
```

Check `http://localhost:4000/health`. It returns `database: connected` when PostgreSQL can be queried.

## Day 1 API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Check API and database |
| GET | `/api/doctors` | List active doctors; supports `search`, `specialty`, `city`, `minPrice`, `maxPrice`, `page`, `limit` |
| GET | `/api/doctors/:id` | Get one active doctor |

The doctor response preserves the existing frontend's field names and array shape. The frontend still points at MockAPI until authentication and appointments are integrated. The API contract is in [openapi.yaml](./openapi.yaml).

## Database and security

The first migration defines users, roles, permissions, patients, doctors, clinics, services, schedules, appointments, records, documents, notifications, reviews and admin logs. It adds a partial unique index for active appointments on `(doctorId, startsAt)`. Booking validation and transaction handling will be added with the appointment API.

`npm run db:seed` is repeatable. It imports only public sample doctors from the frontend's old `db.json` and creates role and permission definitions. It does not create login credentials or import patient appointments.

Day 1 exposes only public read-only doctor routes. No patient or medical-record route is exposed. Do not use real patient data during development.
