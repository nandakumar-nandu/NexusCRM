# NexusCRM - Platform Walkthrough & User Workflow

This walkthrough provides a conceptual explanation of NexusCRM, its current feature status, and the operational workflow followed by B2B sales representatives.

---

## What is a CRM and Who Uses It?

A **Customer Relationship Management (CRM)** platform is a software system designed to store, manage, and optimize all relationship touchpoints between a business and its current or potential customers. 

### Core Users:
- **Sales Representatives**: To track prospects, follow up on deals, log tasks, and monitor active leads.
- **Sales Managers**: To inspect pipeline volume, deal values, and representative conversion rates.
- **Account Managers**: To manage customer profiles, update accounts, and check status parameters.
- **Operations & Administrators**: To configure system inputs, database hooks, and workspace profiles.

---

## Feature Overview

| Feature Module | Description | Status |
| :--- | :--- | :--- |
| **Dashboard Metrics** | Consolidated view of customer counts, active leads, tasks, and sales value. | ✅ Active (Full Dynamic, Recharts, RLS) |
| **Customer Directory** | A central repository for company accounts, email records, and phones. | ✅ Active (Full CRUD, Search, RLS) |
| **Leads Kanban Board** | Visual board organizing deals by sales stages (New, Proposal, Negotiation). | ✅ Active (Drag & Drop, Tables) |
| **Task Scheduler** | Focus-oriented tracker for pending tasks, alerts, and customer check-ins. | ✅ Active (Full CRUD, Filters, RLS) |
| **Reports & Charts** | Bar graphs representing revenue progression and category breakdowns. | 🚧 UI Scaffold (Static Mock) |
| **Settings Panel** | Form panels to manage user accounts and profile metadata. | ✅ Active (Auth Meta Updates) |

*(Note: 🚧 indicates that frontend layout interfaces are established, with database sync operations and interactive hooks planned for future commits)*

---

## Authentication & Session Management

NexusCRM implements secure session tracking using **Supabase Auth** and Next.js **Edge Middleware**. 

### How Authentication Works:
1. **User Sign In**: Logins are verified via email and password using the browser-side client (`signInWithPassword`).
2. **Session Verification**: The root `middleware.ts` intercepts requests to dashboard pages, verifying session cookies in real-time. If expired, tokens are refreshed at the edge layer. Unauthenticated visitors are routed to `/login`.
3. **Demo Sandbox Mode**: For zero-config local testing, developers can bypass database setups by clicking the **Demo Sandbox** option. This saves a temporary `nexus-demo-session=true` cookie and local profiles in standard browser storage, simulating active user sessions.
4. **Session Hydration**: The layout Sidebar listens to auth state changes reactively, displaying name initials or custom avatar images and offering logout triggers.

---

## Analytics Dashboard

The **Dashboard Overview** at `/` is a dynamic hub providing key sales metrics, activity logs, and Recharts integrations.

### Features & Layout:
1. **Consolidated KPI Cards**: Monitors four essential sales indicators:
   - **Total Customers**: The count of registered corporate customer accounts.
   - **Open Deals Value**: The sum of deal values across active stages (excluding Closed).
   - **Due Today**: Incomplete follow-ups set for today's deadline.
   - **Lead Win Rate %**: Percentage conversion rate (Closed deals / Total opportunities).
2. **Sales Funnel (Bar Chart)**: Visualizes the financial volume of opportunities across pipeline stages (New, Contacted, Qualified, Proposal, Closed) using a modern indigo theme.
3. **Tasks Closure Balance (Donut Chart)**: Renders a radial slice representing the ratio of completed vs pending check-ins, displaying a center-aligned completion percentage.
4. **Customer Growth Trend (Line Chart)**: Maps the monthly progression rate of new customer registrations using a smooth bezier curve.
5. **System Activity Feed**: Consolidated list displaying the 5 latest customer additions, task changes, and deal updates.

---

## Managing Customers (CRUD)

Sales representatives can build and structure customer indexes using the **Customers** module.

### Core Functions:
1. **Customer Search & Filters**: Active query matches against contact names, corporate companies, and email records. Filters restrict grids by pipeline stages (Lead, Active, Inactive).
2. **Paginated Data Table**: Pre-rendered rows offset 10 records per page, limiting rendering footprints.
3. **Add Customer Modal**: Uses client-side `react-hook-form` validation backed by `zod` schema constraints (contact name and company are strictly required).
4. **Edit Customer Panel**: Slides-over from the right viewport, letting users modify emails, phones, custom tags, and interaction history.
5. **Delete Safety Prompt**: A modal verification prompts the user to double check before execution.
6. **Row-Level Security (RLS)**: The database is secured with RLS policies, ensuring each authenticated sales representative can only view and edit their own customers. In demo sandbox mode, records are isolated within the browser's `localStorage` namespace.

---

## Sales Pipeline (Leads)

Sales agents track negotiations using an interactive **Kanban Board** pipeline or an alternative **List View** table grid.

### Features & Architecture:
1. **Interactive Kanban Board**: Rendered as 5 columns (New, Contacted, Qualified, Proposal, Closed). Total stages value estimates are summed dynamically.
2. **Drag & Drop Integration**: Utilizes `@dnd-kit/core` with mouse and touch drag sensors. Dragging cards across columns automatically updates stages in the DB (or in browser localStorage caches when offline).
3. **Alternative List View**: Toggles to a structured table listing deal names, linked client names, valuations, close target deadlines, and status levels.
4. **Opportunity Form Modals**: Manage deal entries using Zod validation. Features customer selectors and custom range sliders for closing probabilities.
5. **Row-Level Security (RLS) & Indexes**: Mapped with queries indexes on `customer_id`, `created_by`, and `stage` for pagination performance. Protected by Row-Level Security policies.


---

## Tasks & Customer Activity Timeline

NexusCRM provides a centralized **Tasks Checklist** dashboard and a comprehensive **Customer Activity Timeline** tracking tool.

### Features & Architecture:
1. **Tasks Checklist Dashboard**: Accessible at `/tasks`. Organizes follow-ups, contract preparations, and meeting alerts. Users can search and filter tasks by priority levels (Low, Medium, High) and status (Active, Completed, All).
2. **Task Card Indicators**: Render assignee avatars, priority badges, linked entities (Customer or Deal), and target due dates. Overdue tasks are highlighted in red for immediate visual feedback.
3. **Task Entity Linkage**: Tasks are created with mandatory customer profiles and optional sales opportunity linkages.
4. **Chronological Activity Timeline**: Rendered on the Customer Detail view (`/customers/[id]`), this panel aggregates linked customer notes, tasks creation/completion timestamps, and deal creation records in reverse chronological order.
5. **Add Customer Note**: Form elements let reps save custom notes directly onto the customer's timeline in real-time.

---

## User Workflow Diagram

```mermaid
flowchart TD
    Start([Account Rep Logs In]) --> Stage1[Create Customer Account]
    Stage1 --> Stage2[Open Sales Lead / Value Deal]
    Stage2 --> Stage3[Schedule Task Action Items]
    Stage3 --> Stage4[Conduct Client Demos & Negotiations]
    Stage4 --> Decision{Deal Negotiation Outcome}
    
    Decision -->|Won| Win[Mark Lead as Closed/Won]
    Decision -->|Lost| Loss[Mark Lead as Closed/Lost]
    
    Win --> Analytics[Update Monthly Revenue Reports]
    Loss --> Analytics
    Analytics --> End([End Workflow])
```
