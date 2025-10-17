# Serum Box

Serum Box is a laboratory sample and reagent management platform built with **Next.js 14**. The application digitalises daily operations for clinical laboratories and research teams—tracking racks (“gradillas”), tubes, reagents, stock levels, audit history, and user access—while orchestrating subscription billing and multi-channel payments.

## Project Overview

| Area | Highlights |
| --- | --- |
| Product | Full-stack SaaS that centralises inventory, freezer racks, and tube metadata for laboratory environments. |
| Users | Supports main and secondary lab users with granular permissions, audit logs, and alerts (low stock, expiring trials). |
| Monetisation | Subscription-aware dashboards with Stripe, PayPal, automatic plan upgrades, webhooks, and billing webviews. |
| Communication | Automated email flows for onboarding, verification, password recovery, and support (Nodemailer SMTP). |

## Tech Stack

- **Frontend**
  - Next.js 14 App Router (RSC + Route Handlers) with TypeScript.
  - Chakra UI design system + Tailwind CSS utilities + Framer Motion animations.
  - Zustand for lightweight client state (e.g., modal and selection stores).
  - Metricool script instrumentation for marketing analytics.

- **Backend & Data**
  - Next.js server actions and API route handlers.
  - NextAuth with Prisma adapter for authentication, verification codes, trial logic, and multi-user tenancy.
  - Prisma ORM targeting MongoDB (Atlas-ready) with models for users, gradillas, tubes, reagents, stock units, and audit logs.
  - Payment SDKs: Stripe Billing, PayPal Subscriptions, MercadoPago checkout, plus webhook validation endpoints.
  - Nodemailer for transactional messaging and password reset workflows.

- **Tooling & Ops**
  - TypeScript 5, ESLint, Chakra theme configuration, Tailwind 3.4.
  - Prisma migrations & script utilities (`src/scripts/testPlans.ts`).
  - Deployment-ready for Vercel / Node 18 runtimes.

## Key Features

- **Laboratory Inventory**
  - Interactive rack (gradilla) and tube mapping with metadata modals.
  - Stock dashboards, analytics charts, and reagent inventory with low-stock alerts.
  - Audit logging of CRUD actions and exports for compliance.

- **User & Access Management**
  - Email verification, password recovery, and role propagation for secondary lab users.
  - Session management backed by NextAuth + Prisma Sessions collection.

- **Billing & Plans**
  - Pricing tables, plan comparison, and upgrade flows.
  - Unified payment layer supporting Stripe, PayPal, and MercadoPago subscriptions.
  - Webhook receivers to keep plan status and entitlements in sync.

- **Support & Marketing**
  - FAQ, testimonials, pricing sections, and lead capture widgets.
  - Email support form and trial alerts for improved customer success.

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   - Duplicate `.env.example` → `.env` or `.env.local`.
   - Provide MongoDB connection (`DATABASE_URL`), OAuth secrets for NextAuth, email SMTP credentials, and Stripe/PayPal/MercadoPago keys.

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
- `npm run test:plans` — Executes `src/scripts/testPlans.ts` to validate subscription configurations.

---

This repository showcases end-to-end product thinking: domain modelling with Prisma/MongoDB, secure authentication flows, real-time dashboards, and multi-gateway billing—all wrapped in a modern Next.js 14 UI. Ideal for portfolio or CV entries highlighting practical SaaS architecture for laboratory operations.
