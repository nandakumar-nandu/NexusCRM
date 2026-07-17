# Changelog

All notable changes to the NexusCRM project will be documented in this file.

## [0.4.0] - 2026-07-17 16:10

### Added
- SQL migration script `/lib/db/002_leads.sql` creating leads table, foreign keys, query indexes, and Row Level Security (RLS) policies.
- Drag-and-drop support dependencies (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`).
- Modular client-side leads database service `/lib/services/leadsService.ts` supporting full opportunity CRUD and joined customer lookups with sandbox offline overrides.
- Dynamic Kanban pipeline layout `/app/(dashboard)/leads/page.tsx` rendering columns corresponding to deal stages and responsive cards displaying client name, value, target close date, and probability indicators.
- Alternative tabular List View layout toggled via visual controls.
- Add/Edit lead modals with drop-down customer selection and probability slider forms validated using Zod.

## [0.3.0] - 2026-07-17 16:02

### Added
- SQL migration script `/lib/db/001_customers.sql` defining customers table schema and setting up Row Level Security (RLS) policies.
- Form management and schema validation library dependencies (`react-hook-form`, `zod`, `@hookform/resolvers`).
- Modular client-side customer service handler (`/lib/services/customersService.ts`) supporting pagination, filter matching, and local sandbox cache CRUD fallback.
- Interactive paginated data tables for customers lists inside `/app/(dashboard)/customers/page.tsx`.
- Visually rich customer registration modal and slide-out edit drawer panels configured with Zod schema resolution validation checks.
- Delete customer safety prompt dialogs.

## [0.2.0] - 2026-07-17 15:54

### Added
- Modular Supabase client integration under `/lib/supabase/` containing `client.ts` (browser), `server.ts` (server actions/route headers context), and `middleware.ts` (session refresh).
- Root `middleware.ts` safeguarding `/app/(dashboard)/*` routes and redirecting unauthenticated users to `/login`.
- Clean route group isolation (`(dashboard)` for authenticated application sections and `(auth)` for login pages).
- Visual centered Login form (`/app/(auth)/login/page.tsx`) with real Supabase session inputs and sandbox demo fallbacks.
- Settings/Profile edit forms (`/app/(dashboard)/settings/page.tsx`) to update profile display name and avatars in user metadata.
- Interactive user sessions cards in the Sidebar footer, showing active avatars and text names, and featuring logout controls.

## [0.1.0] - 2026-07-14 14:15

### Added
- Next.js 14 App Router scaffold with TypeScript support.
- Tailwind CSS configuration with deep dark theme accents.
- Lucide React icon configurations.
- Client-side Supabase client connector initialization (`/lib/supabase.ts`).
- Shell layouts consisting of Sidebar, TopBar, and PageWrapper components.
- Initial dashboard views and interactive layout pages for Customers, Leads, Tasks, Reports, and Settings.
- Documentation containing architectural diagrams, database layouts, and guides (README, CHANGELOG, WALKTHROUGH, SCREENTOUR).
