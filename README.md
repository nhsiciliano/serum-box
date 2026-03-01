# Serum Box

Serum Box is a laboratory sample and reagent management platform built with **Next.js 14**. The application digitalises daily operations for clinical laboratories and research teams by tracking racks (“gradillas”), tubes, reagents, stock levels, audit history, and user access.

## Project Overview

| Area | Highlights |
| --- | --- |
| Product | Full-stack SaaS that centralises inventory, freezer racks, and tube metadata for laboratory environments. |
| Users | Supports main and secondary lab users with granular permissions, audit logs, and inventory alerts. |
| Access | Full platform access is enabled for authenticated users after login. |
| Communication | Supabase Auth emails for confirmation and password recovery, plus support emails via SMTP. |

## Tech Stack

- **Frontend**
  - Next.js 14 App Router (RSC + Route Handlers) with TypeScript.
  - Chakra UI design system + Tailwind CSS utilities + Framer Motion animations.
  - Zustand for lightweight client state (e.g., modal and selection stores).
  - Metricool script instrumentation for marketing analytics.

- **Backend & Data**
  - Next.js server actions and API route handlers.
  - NextAuth session layer with Supabase Auth (email/password) as identity provider.
  - Prisma ORM targeting Supabase PostgreSQL with models for users, gradillas, tubes, reagents, stock units, and audit logs.
  - Supabase email confirmation and password recovery links.

- **Tooling & Ops**
  - TypeScript 5, ESLint, Chakra theme configuration, Tailwind 3.4.
  - Prisma migrations & script utilities (`src/scripts/testAccess.ts`).
  - Deployment-ready for Vercel / Node 18 runtimes.

## Key Features

- **Laboratory Inventory**
  - Interactive rack (gradilla) and tube mapping with metadata modals.
  - Stock dashboards, analytics charts, and reagent inventory with low-stock alerts.
  - Audit logging of CRUD actions and exports for compliance.

- **User & Access Management**
  - Email confirmation and password recovery handled by Supabase Auth.
  - Session management backed by NextAuth JWT and role propagation for secondary lab users.

- **Platform Access**
  - Full feature access for authenticated users.
  - No payment or subscription flow required.

- **Support & Marketing**
  - FAQ, testimonials, and lead capture widgets.
  - Email support form for customer success.

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   - Duplicate `.env.example` → `.env` or `.env.local`.
   - Provide Supabase PostgreSQL connections (`DATABASE_URL` and `DIRECT_URL`), Supabase auth client keys (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`), and NextAuth secrets.

3. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`.

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## Testing & Utilities

- `npm run lint` — ESLint checks.
- `npm run test:access` — Executes `src/scripts/testAccess.ts` to validate authenticated full-access checks.
- `npm run migrate:mongo-export` — Imports historical data from local Mongo exports into Supabase PostgreSQL.

## Mongo -> Supabase Migration

1. Export Mongo collections to JSON (`mongoexport`), one file per collection, into a folder such as `./mongo-export`:
   - `User.json`, `Account.json`, `Session.json`, `Gradilla.json`, `Tube.json`, `AuditLog.json`, `Reagent.json`, `Stock.json`
   - Example commands:
     ```bash
     mongoexport --uri="$MONGODB_URI" --collection=User --out=./mongo-export/User.json
     mongoexport --uri="$MONGODB_URI" --collection=Account --out=./mongo-export/Account.json
     mongoexport --uri="$MONGODB_URI" --collection=Session --out=./mongo-export/Session.json
     mongoexport --uri="$MONGODB_URI" --collection=Gradilla --out=./mongo-export/Gradilla.json
     mongoexport --uri="$MONGODB_URI" --collection=Tube --out=./mongo-export/Tube.json
     mongoexport --uri="$MONGODB_URI" --collection=AuditLog --out=./mongo-export/AuditLog.json
     mongoexport --uri="$MONGODB_URI" --collection=Reagent --out=./mongo-export/Reagent.json
     mongoexport --uri="$MONGODB_URI" --collection=Stock --out=./mongo-export/Stock.json
     ```
2. Point your `.env` to Supabase (`DATABASE_URL` and `DIRECT_URL`).
3. Run:
   ```bash
   npm run migrate:mongo-export
   ```
4. Optional custom export path:
   ```bash
   MONGO_EXPORT_DIR=/absolute/path/to/export npm run migrate:mongo-export
   ```
5. Verify migrated counts and key relations:
   ```bash
   npm run migrate:verify
   ```
6. Optional strict mode (fails on any count mismatch):
   ```bash
   STRICT_COUNTS=true npm run migrate:verify
   ```

---

This repository showcases end-to-end product thinking: domain modelling with Prisma/Supabase PostgreSQL, secure authentication flows, and real-time operational dashboards, all wrapped in a modern Next.js 14 UI. Ideal for portfolio or CV entries highlighting practical SaaS architecture for laboratory operations.
