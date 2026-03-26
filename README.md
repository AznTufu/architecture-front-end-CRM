# Pulse CRM SaaS

Pulse CRM is a SaaS-style CRM frontend built with React, TypeScript, and Feature-Sliced Design.

## Production Application

- Production URL: https://architecture-front-end-crm-m4nw.vercel.app/

## Admin Test Credentials

Use these credentials to test the admin account in the deployed app:

- Email: admin@admin.fr
- Password: admin123

## Technical Stack and Rationale

### Frontend

- React 19
- TypeScript (strict mode)
- Vite

### State and Data Layer

- Zustand (with persist)
- TanStack React Query
- Zod + React Hook Form

Rationale:

- Zustand handles lightweight UI state (filters, saved views, UI preferences).
- React Query centralizes server state, cache, and mutation invalidation.
- Zod ensures runtime validation for API payloads/responses and form validation.

### Backend

- Supabase (Auth + Postgres + SQL migrations)

Why Supabase:

- Fast setup for authentication and relational data.
- Good fit for a frontend-focused architecture assignment.
- SQL migrations keep schema evolution explicit and reproducible.

## User Scoping (RLS + Policies)

User scoping is enforced at the database level with Supabase Row Level Security.

Primary migration reference:

- `supabase/migrations/20260325100000_reset_crm_schema.sql`

What is enforced:

- RLS is enabled on `profiles`, `companies`, `contacts`, `deals`, `activities`, `invitations`.
- `companies_manage`: user can access rows where `auth.uid() = user_id`, or is `superadmin`.
- `contacts_manage`: user can access rows where `auth.uid() = user_id`, or is `superadmin`.
- `deals_manage`: user can access rows where `auth.uid() = user_id`, or is `superadmin`.
- `activities_manage`: user can access rows where `auth.uid() = user_id`, or is `superadmin`.
- `profiles_select` / `profiles_update`: user can read/update own profile (`auth.uid() = id`), or `superadmin`.
- `invitations_superadmin_manage`: only `superadmin` can manage invitations.

Role resolution used by policies:

- `public.current_user_role()` returns role from `public.profiles` for current authenticated user.

Additional RPC scoping for deal write actions:

- `supabase/migrations/20260325113000_add_update_deal_stage_rpc.sql`
- `supabase/migrations/20260325123000_add_update_delete_deal_rpc.sql`

These RPC functions (`update_deal_stage`, `update_deal`, `delete_deal`) include ownership checks:

- action allowed only when `user_id = auth.uid()` or user role is `superadmin`.

### FSD Slicing Strategy

- `app`: application bootstrap, providers, router, auth guards.
- `pages`: route-level composition.
- `widgets`: composite UI blocks used by pages.
- `features`: user use-cases (create contact/deal/company, filters, auth flows).
- `entities`: business entities (contact, deal, company, activity).
- `shared`: reusable infrastructure (api client, query keys, config, global store).

This split keeps business logic close to the domain while preserving clear import direction.

## Project Architecture

The application follows a strict Feature-Sliced Design layering model.

Dependency direction:

- `app` -> `pages` -> `widgets` -> `features` -> `entities` -> `shared`

Architectural principles:

- Upper layers compose lower layers and never the opposite.
- Business logic is colocated inside `features` and `entities`.
- `shared` contains only reusable technical building blocks.
- Data access is isolated in `api` folders and consumed through hooks/mutations.

### Layer Responsibilities

- `app`: root providers, auth session sync, router, route protection.
- `pages`: route-level orchestration and composition.
- `widgets`: larger interface sections built from multiple features/entities.
- `features`: user-intent driven logic (create, filter, authenticate, open drawers).
- `entities`: domain-level model, API access, and presentation primitives.
- `shared`: framework-agnostic utilities, API client, configuration, and global UI store.

### Project Tree and Layer Explanation

```text
src/
	app/        # App bootstrap: router, providers, auth guard
	pages/      # Route pages (Home, Contacts, Deals, Settings, Login)
	widgets/    # Large UI sections composed from features/entities
	features/   # User actions and business use-cases
	entities/   # Domain entities: api/model/ui per entity
	shared/     # Cross-cutting code: api, auth, config, store
	test/       # Unit/component/integration tests (Vitest + RTL)

supabase/
	migrations/ # SQL schema and RPC migrations

scripts/
	seed.mjs    # Optional seed script
```

## Complete Local Installation Guide

### Prerequisites

- Node.js 22.12+ recommended
- npm
- Supabase CLI (for local/remote DB migration workflow)

### 1. Clone repository

```bash
git clone https://github.com/AznTufu/architecture-front-end-CRM.git
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file at project root:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

These values are required to run the frontend against your Supabase project.

Where to find `SUPABASE_SERVICE_ROLE_KEY`:

- Open your Supabase project dashboard.
- Go to `Project Settings` -> `API`.
- In the `Project API keys` section, copy the `service_role` key.

Important:

- `SUPABASE_SERVICE_ROLE_KEY` is a secret key with elevated permissions.
- Keep it only local private env files.

### 4. Run database migrations
Your workflow requires linking a remote project first:

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

### 5. Optional seed

```bash
npm run db:seed
```

### 6. Start development server

```bash
npm run dev
```

### 7. Run tests

```bash
npm run test:run
```

### 8. Build for production

```bash
npm run build
```

## Available Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`
- `npm run test:run`
- `npm run db:seed`
