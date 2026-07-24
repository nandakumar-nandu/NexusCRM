# Changelog

All notable changes to the NexusCRM project will be documented in this file.

## [1.2.0] - 2026-07-24 14:00

### Added
- Resend + React Email integration for transactional email delivery (`/lib/email/resendClient.ts` and `emailService.ts`).
- React Email templates: `WelcomeCustomerEmail.tsx`, `TaskReminderEmail.tsx`, `DealClosedEmail.tsx`, and `WeeklyReportEmail.tsx`.
- Internal email API route (`/app/api/email/send/route.ts`) with RBAC authorization and Zod payload validation.
- Email preferences settings page (`/app/(dashboard)/settings/email/page.tsx`) with test email triggers.
- SQL migrations `006_user_preferences.sql` and `007_user_preferences.sql` adding `email_preferences` JSONB column.
- Supabase Edge Functions in Deno (`daily-task-reminders` and `weekly-report-sender`) configured for pg_cron execution (`0 8 * * *` and `0 7 * * 1`).
- PostgreSQL RPC migration `007_rpc_weekly_kpi.sql` and `008_rpc_weekly_kpi.sql` with SECURITY DEFINER `get_weekly_kpi_snapshot()`.
- 4-step Custom Report Builder wizard (`/app/(dashboard)/reports/builder/page.tsx`) supporting whitelist query building, CSV downloads, and template saving.
- Report Builder service `reportBuilderService.ts` and SQL migration `008_saved_reports.sql` / `009_saved_reports.sql`.
- Public Developer REST API v1 endpoints under `/app/api/v1/` for Customers, Leads, Tasks, and Headless Report Execution.
- Bearer API key authentication middleware (`/lib/middleware/apiKeyAuth.ts`), standardized API types (`/types/api.ts`), and SQL migration `009_api_keys.sql` / `010_api_keys.sql` using bcrypt hashing.
- API Keys management UI (`/app/(dashboard)/settings/api/page.tsx`) with one-time raw secret key reveal pattern.
- In-app interactive developer reference documentation (`/app/(dashboard)/settings/api/docs/page.tsx`) with cURL copy functionality.

## [1.1.0] - 2026-07-24 13:48

### Added
- Real-time Supabase database event subscription hooks (`useRealtimeCustomers.ts` and `useRealtimeLeads.ts`) providing live table updates.
- Real-time user online presence tracking hook (`usePresence.ts`) and avatar presence bubbles component (`PresenceIndicators.tsx`).
- SQL migration scripts `/lib/db/004_notifications.sql` and `/lib/db/005_notifications.sql` creating user notifications table with RLS security policies.
- SQL migration scripts `/lib/db/005_activity_log.sql` and `/lib/db/006_activity_log.sql` creating append-only immutable audit trail table with JSONB diff fields and 90-day retention comments.
- Client services layer `notificationsService.ts` and `activityLogService.ts` with JSDoc comments and offline sandbox fallbacks.
- Supabase Database Webhook HTTP route `/app/api/webhooks/activity/route.ts` with HMAC-SHA256 signature verification and idempotency deduplication.
- Notification bell component (`NotificationBell.tsx`) embedded into TopBar with live unread badge counters and quick dropdown list.
- Notifications Center page (`/app/(dashboard)/notifications/page.tsx`) with category tabs (`All`, `Unread`, `Mentions`) and pagination.
- `@` Mention parser hook (`useMentionParser.ts`) and autocomplete textarea component (`MentionTextarea.tsx`).

## [1.0.0] - 2026-07-17 19:35

### Added
- Root global error boundaries (`/app/error.tsx` and `/app/(dashboard)/error.tsx`) to intercept component rendering crashes gracefully with diagnostic logging and retry buttons.
- High-fidelity visual skeleton loading states (`animate-pulse`) across all tabular listing pages (Customers, Leads list, Tasks checklist) and analytics charts (KPI cards, bar/donut/line charts) replacing standard spinners.
- Thoroughly documented environment variables template `.env.example`.
- Completed all project technical walkthroughs and screen tours detailing PWA support, CSV exports, role access checks, and databases.

## [0.7.0] - 2026-07-17 19:30

### Added
- Local and Supabase-based client-side role verification service (`/lib/services/roleService.ts`).
- Database migration script `/lib/db/004_roles.sql` defining `public.user_roles` lookup table and corresponding RLS policies for Viewer (read-only), Manager (edit, no delete), and Admin (full control) roles.
- Dynamic visual interface changes according to active role: hiding additions and deletes for viewers, and hiding deletes for managers.
- Settings page role testing switcher dropdown for sandbox evaluation.
- Browser-side CSV Data Export buttons on Customers and Leads page tables powered by `papaparse` library.
- Progressive Web App (PWA) configuration with `next-pwa`, complete manifest properties, custom app icons, and WiFi disconnect offline fallback route `/offline`.

## [0.6.0] - 2026-07-17 19:15

### Added
- Modular client-side database analytics service `/lib/services/analyticsService.ts` aggregating metrics for KPI cards, sales stages values, customer growth trends, and task closure ratios.
- Fully-featured interactive Analytics Dashboard `/app/(dashboard)/page.tsx` replacing previous mock placeholders. It incorporates:
  - 4 dynamic KPI cards (Total Customers count, Open Deals value, Tasks due today, Win Rate percentage).
  - Sales Funnel (Recharts BarChart) displaying allocations across deal stages.
  - Tasks Closure Balance (Recharts PieChart) showing completed vs pending task ratios with center-aligned progress readout.
  - Customer Growth Trend (Recharts LineChart) mapping customer profile creations.
  - Live activity logs tracking recent updates.
- Detailed code comments on all Recharts components detailing the visual control parameters of each chart property.

## [0.5.0] - 2026-07-17 19:00

### Added
- SQL migration script `/lib/db/003_tasks.sql` creating tasks and customer_notes tables, defining FK constraints, RLS policies, and indexes.
- Modular client-side tasks and notes service layer `/lib/services/tasksService.ts` supporting task CRUD, task completion toggling, and customer notes additions with sandbox offline overrides.
- Fully-featured checklist view `/app/(dashboard)/tasks/page.tsx` with filter controls (active, completed, priority levels) and overdue items highlighted in red.
- Linked Customer Details page `/app/(dashboard)/customers/[id]/page.tsx` including profile information headers, related leads panels, inline notes addition forms, and a unified chronological activity timeline (notes, tasks, opportunities).
- Clickable link triggers in `/app/(dashboard)/customers/page.tsx` mapping customer row contact names to detail pages.

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
