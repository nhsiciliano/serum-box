# AGENTS.md

Guidance for coding agents operating in this repository.

## 1) Project Snapshot

- Stack: Next.js 14 App Router + TypeScript + Chakra UI.
- State/Auth: NextAuth (JWT sessions) + Supabase Auth (email/password identity).
- Data: Prisma + Supabase PostgreSQL.
- Package manager: npm (`package-lock.json` is authoritative).
- Import alias: `@/*` -> `src/*`.

## 2) Environment And Setup

1. Install deps:
   - `npm install`
2. Create env file:
   - Copy `.env.example` -> `.env`.
3. Required auth vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (or `NEXT_PUBLIC_URL` for links)
4. Required DB vars:
   - `DATABASE_URL`
   - `DIRECT_URL`
5. Generate Prisma client:
   - `npx prisma generate`
6. Run dev server:
   - `npm run dev`

Notes:
- Never commit `.env` files.
- Prefer `.env.example` updates when adding new env requirements.

## 3) Build / Lint / Test Commands

- Dev: `npm run dev`
- Build: `npm run build`
- Start (prod): `npm run start`
- Lint: `npm run lint`
- Access check: `npm run test:access`
- Data migration import: `npm run migrate:mongo-export`
- Data migration verification: `npm run migrate:verify`

Useful direct commands:
- Prisma client only: `npx prisma generate`
- Build internals: `prisma generate && next build`
- Access check direct: `npx ts-node -P tsconfig.scripts.json src/scripts/testAccess.ts`

## 4) Single-Test Guidance

Current repo does not have Jest/Vitest/Playwright test suites.

Meaning of "single test" here:
- Only one test-like script exists:
  - `npm run test:access`

If maintainers later add a framework, follow it.
Until then, do not invent new test infra unless explicitly requested.

## 5) Repository Structure Conventions

- App routes and layouts: `src/app/**`
- API handlers: `src/app/api/**/route.ts`
- Shared utilities: `src/lib/**`
- Reusable UI components: `src/components/**`
- Hooks: `src/hooks/**` (prefix with `use`)
- Types: `src/types/**`
- Utility scripts: `src/scripts/**`

## 6) Next.js Conventions (Must Follow)

- Prefer Server Components by default.
- Add `'use client'` only when browser hooks/state/events are needed.
- Keep route handlers thin; move reusable logic into `src/lib`.
- Do not combine `page.tsx` and `route.ts` at the same segment path.
- For auth/session-based handlers, explicit dynamic behavior is used:
  - `export const dynamic = 'force-dynamic'`
- Use Metadata API (`metadata`, `generateMetadata`) instead of manual `<head>` tags.
- Use `next/image` for UI images instead of Chakra `Image`/raw `<img>`.

## 7) Auth Model (Current)

- Identity provider: Supabase Auth (email/password).
- Session layer for app: NextAuth JWT.
- Login flow:
  - `CredentialsProvider` calls Supabase `signInWithPassword`.
- Registration flow:
  - API creates Supabase user (`signUp`) and stores app user in Prisma.
  - Email confirmation is Supabase-managed (link based).
- Password recovery:
  - Supabase `resetPasswordForEmail` + client `updateUser({ password })`.

When touching auth:
- Keep Supabase and Prisma user linkage consistent (`supabaseAuthId`).
- Preserve middleware route protection behavior under `/dashboard/:path*`.

## 8) TypeScript Guidelines

- `strict: true` is enabled; keep code fully typed.
- Prefer explicit types for props, API payloads, and return values.
- Avoid `any`; if absolutely unavoidable, isolate and justify.
- Reuse shared types from `src/types` when possible.
- Keep NextAuth module augmentation consistent with `src/lib/auth.ts`.

## 9) Imports And Module Boundaries

- Import order in each file:
  1) framework/third-party
  2) internal alias imports (`@/...`)
  3) relative imports
- Prefer `@/` alias over deep relative traversal.
- Avoid circular dependencies between `lib`, `hooks`, and `components`.

## 10) Naming Conventions

- Components: PascalCase (`DashboardHeader.tsx`).
- Hooks: `useXxx` (`useFetchWithAuth`).
- Variables/functions: camelCase.
- Constants: UPPER_SNAKE_CASE for true constants.
- Route handlers: named exports (`GET`, `POST`, `PUT`, `DELETE`).

## 11) Formatting And Style

- Lint baseline: `eslint-config-next` (`next/core-web-vitals`).
- No dedicated Prettier config; preserve local file style.
- Keep functions focused and readable.
- Add comments only for non-obvious intent.
- Do not introduce unrelated refactors in task-scoped changes.

## 12) API And Error Handling

- Validate auth early in protected handlers.
- Return JSON via `NextResponse.json(...)` consistently.
- Use clear status codes:
  - `400` invalid input
  - `401` unauthorized
  - `403` forbidden
  - `404` not found
  - `500` unexpected server failure
- Wrap DB and external calls in `try/catch`.
- Log server errors with context, but never leak secrets in responses.

## 13) Prisma And Data Rules

- Use `@/lib/prisma` singleton client.
- Keep schema updates in `prisma/schema.prisma`.
- After schema changes, regenerate client.
- Prefer migrations; if environment blocks interactive migration commands, document what was run.
- Keep one-off migration scripts in `src/scripts`.

## 14) UI Rules

- Keep Chakra UI patterns consistent with existing components.
- Maintain responsive behavior (desktop + mobile).
- Avoid introducing a second design system style pattern.
- Preserve accessibility basics (labels, button text, aria labels).

## 15) Agent Execution Checklist

Before handing off substantial changes:
1. `npm run lint`
2. `npm run build` (for app/runtime-impacting changes)
3. `npm run test:access` (when auth/access/session behavior changes)

If command execution is blocked, report exactly what could not be validated.

## 16) Cursor / Copilot Rule Audit

Checked:
- `.cursorrules`
- `.cursor/rules/`
- `.github/copilot-instructions.md`

Result:
- No Cursor rules found.
- No Copilot instructions found.

If these files are added later, treat them as higher-priority repo instructions and update this AGENTS.md accordingly.
