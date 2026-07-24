<div align="center">
  <img src="public/icon-192x192.png" width="72" alt="NexusCRM Logo" />
  <h1>✨ Nexus<span style="color: #38bdf8;">CRM</span></h1>
  <p><b>Enterprise Customer Relationship Management Platform</b></p>
</div>

---

NexusCRM is a next-generation, high-performance Customer Relationship Management platform designed for B2B sales teams. Built using Next.js 14 (App Router), TypeScript, Tailwind CSS, and Supabase (PostgreSQL), it offers a fast, visually rich interface to manage customers, track active sales pipelines, schedule action-item tasks, and view revenue analytics.

## Screens

| SignIn | Dashboard | Customers |
|---|---|---|
| ![SignIn](public/screenshots/SignIn.png) | ![Dashboard](public/screenshots/Dashboard.png) | ![Customers](public/screenshots/Customers.png) |

| Tasks | Leads | Reports |
|---|---|---|
| ![Tasks](public/screenshots/Tasks.png) | ![Leads](public/screenshots/Leads.png) | ![Reports](public/screenshots/Reports.png) |

---

## 🌐 Live Demo

Experience the live deployment of NexusCRM:

🔗 **[https://www.nexuscrm.kpebble.com](https://www.nexuscrm.kpebble.com)**

> [!TIP]
> Click **"Explore Demo Sandbox (No Config Needed)"** on the sign-in page to instantly test all CRM features, Kanban drag-and-drop, custom report builders, and developer API management without creating an account!

---

## Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-14.2.35-000000?style=for-the-badge&logo=nextdotjs) ![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwindcss) ![Supabase](https://img.shields.io/badge/Supabase-2.110.4-3ECF8E?style=for-the-badge&logo=supabase) ![Recharts](https://img.shields.io/badge/Recharts-3.9.2-22B5BF?style=for-the-badge) ![PapaParse](https://img.shields.io/badge/PapaParse-5.5.4-FF8000?style=for-the-badge) ![next-pwa](https://img.shields.io/badge/next--pwa-5.6.0-000000?style=for-the-badge) ![dnd-kit](https://img.shields.io/badge/dnd--kit-6.3.1-6366F1?style=for-the-badge)

---

## Feature Overview

1. **Dashboard Overview** - Visual tracking of pipeline metrics, conversion progress, and monthly target stats.
2. **Customer Directory** - An indexed database of corporate clients, status badges, and contact details.
3. **Leads & Pipeline Kanban Board** - Interactive deal staging and real-time sales pipeline management.
4. **Task Management** - Tracking of time-sensitive sales tasks and priority assignments.
5. **Analytics & Reports** - Insights on monthly revenues and product category distribution.
6. **Settings Panel** - Configuration tools for workspace credentials and Supabase database integrations.

---

## System Architecture

```mermaid
graph TD
    Client[Next.js App Router Client] <-->|Supabase Client SDK| SupabaseAPI[Supabase Edge API]
    SupabaseAPI <-->|SQL Client Connection| PG[(PostgreSQL Database)]
    Client <-->|Asset Rendering| NextServer[Next.js Server App]
```

### Authentication Flow

```mermaid
sequenceDiagram
    actor User as User Agent
    participant Edge as Next.js Edge Middleware
    participant App as Next.js Server App
    participant DB as Supabase Auth Server

    User->>Edge: Request Dashboard Page (e.g., "/")
    Edge->>Edge: Check Auth cookies / Demo Sandbox credentials
    alt Unauthorized
        Edge-->>User: Redirect to "/login"
    else Authorized
        Edge->>App: Forward Request
        App->>DB: Validate Session / Query DB
        DB-->>App: Database Records
        App-->>User: Rendered Dashboard HTML Page
    end

    Note over User, DB: When Login form is submitted
    User->>User: Enter email & password
    User->>DB: signInWithPassword()
    DB-->>User: Session Object + Token Cookies
    User->>Edge: Request "/" (w/ cookies)
    Edge-->>User: Forward and Render page
```

### Real-Time Webhook & Notification Flow

```mermaid
sequenceDiagram
    actor User as User Agent / Rep
    participant DB as PostgreSQL Database
    participant Hook as Webhook Route (/api/webhooks/activity)
    participant Log as Activity Log Table
    participant Notif as Notifications Table
    participant Bell as TopBar Notification Bell

    User->>DB: Perform Action (e.g. Update Lead Stage)
    DB->>Hook: Trigger Database Webhook Event (POST)
    Hook->>Hook: Verify HMAC Signature & Deduplicate Event
    Hook->>Log: Write Audit Trail (JSONB Diff)
    Hook->>Notif: Create Notification Entry
    Notif-->>Bell: Realtime Subscription Broadcast
    Bell-->>User: Update Unread Badge Count & Dropdown Item
```

### Transactional Email Send Flow

```mermaid
sequenceDiagram
    actor App as Next.js App / Cron Worker
    participant API as Email Route (/api/email/send)
    participant Template as React Email Template
    participant Resend as Resend REST API
    actor Client as Recipient Email Inbox

    App->>API: POST /api/email/send (template, payload)
    API->>API: Validate Session / RBAC + Zod Body
    API->>Template: Render JSX to Inline HTML
    API->>Resend: HTTPS POST /emails (API Key)
    Resend-->>Client: Deliver Email to Inbox
```

### Developer REST API Request Lifecycle

```mermaid
sequenceDiagram
    actor Script as Integration Script (cURL / Python)
    participant Auth as API Key Auth Middleware
    participant DB as Postgres API Keys Table
    participant Route as API v1 Route Handler

    Script->>Auth: Request (Bearer nx_live_...)
    Auth->>DB: Lookup key_preview & Fetch key_hash
    Auth->>Auth: bcrypt.compare(rawKey, key_hash)
    alt Invalid or Lacks Permission Scope
        Auth-->>Script: HTTP 401 / 403 JSON Error
    else Valid & Authorized
        Auth->>Route: Pass Context & Execute Query
        Route-->>Script: HTTP 200 OK (ApiResponse<T>)
    end
```

---

## Transactional Email Events

| Template | Trigger Condition | Recipient | Render Engine |
| :--- | :--- | :--- | :--- |
| `WelcomeCustomerEmail` | New customer profile added | Registered Customer | React Email + Resend |
| `TaskReminderEmail` | Daily 08:00 UTC pg_cron task scan | Task Assignee | React Email + Resend |
| `DealClosedEmail` | Sales lead stage moved to Closed/Won | Account Lead / Manager | React Email + Resend |
| `WeeklyReportEmail` | Monday 07:00 UTC pg_cron KPI brief | Executives & Managers | React Email + Resend |

---

## Developer REST API v1 Endpoints

| Resource | Method | Path | Required Scope | Description |
| :--- | :--- | :--- | :--- | :--- |
| Customers | `GET` | `/api/v1/customers` | `read:customers` | List & search customer profiles |
| Customers | `POST` | `/api/v1/customers` | `write:customers` | Create new customer profile |
| Customers | `GET` | `/api/v1/customers/:id` | `read:customers` | Retrieve customer profile by ID |
| Customers | `PUT` | `/api/v1/customers/:id` | `write:customers` | Update customer record |
| Customers | `DELETE` | `/api/v1/customers/:id` | `delete:customers` | Delete customer record |
| Leads | `GET` | `/api/v1/leads` | `read:leads` | List sales pipeline deals |
| Leads | `POST` | `/api/v1/leads` | `write:leads` | Create new deal |
| Tasks | `GET` | `/api/v1/tasks` | `read:tasks` | List assigned tasks |
| Tasks | `POST` | `/api/v1/tasks` | `write:tasks` | Create new task item |
| Reports | `POST` | `/api/v1/reports/run` | `execute:reports` | Run custom report config headlessly |

---

## Planned Database Schema

```mermaid
erDiagram
    CUSTOMERS ||--o{ LEADS : owns
    CUSTOMERS ||--o{ TASKS : references
    LEADS ||--o{ TASKS : references
    CUSTOMERS ||--o{ CUSTOMER_NOTES : references
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ ACTIVITY_LOG : triggers
    USERS ||--o{ USER_PREFERENCES : configures
    USERS ||--o{ SAVED_REPORTS : creates
    USERS ||--o{ API_KEYS : generates
    
    CUSTOMERS {
        uuid id PK
        string name
        string company
        string email
        string phone
        string status
        string_array tags
        string notes
        uuid created_by FK
        timestamp created_at
        timestamp updated_at
    }
    LEADS {
        uuid id PK
        string title
        uuid customer_id FK
        numeric value
        string stage
        uuid created_by FK
        timestamp created_at
    }
    TASKS {
        uuid id PK
        string title
        uuid customer_id FK
        uuid lead_id FK
        date due_date
        string priority
        boolean completed
        uuid created_by FK
        timestamp created_at
    }
    CUSTOMER_NOTES {
        uuid id PK
        uuid customer_id FK
        string content
        uuid created_by FK
        timestamp created_at
    }
    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        string type
        string title
        string body
        string link
        boolean is_read
        timestamp created_at
    }
    ACTIVITY_LOG {
        uuid id PK
        uuid actor_id FK
        string entity_type
        string entity_id
        string action
        jsonb diff
        timestamp occurred_at
    }
    USER_PREFERENCES {
        uuid id PK
        uuid user_id FK
        jsonb email_preferences
        timestamp updated_at
    }
    SAVED_REPORTS {
        uuid id PK
        string name
        jsonb config
        uuid created_by FK
        string schedule
        timestamp created_at
    }
    API_KEYS {
        uuid id PK
        uuid user_id FK
        string name
        string key_hash
        string key_preview
        string_array permissions
        timestamp last_used_at
        timestamp expires_at
        timestamp created_at
    }
```

## Security & Role-Based Access Control (RBAC)

NexusCRM enforces three access roles to govern data modifications and dashboard behaviors:

| Access Role | View Listings / Analytics | Add / Edit Records | Delete Records |
| :--- | :---: | :---: | :---: |
| **Viewer** | ✅ Yes | ❌ No | ❌ No |
| **Manager** | ✅ Yes | ✅ Yes | ❌ No |
| **Admin** | ✅ Yes | ✅ Yes | ✅ Yes |

---

## Leads Pipeline Funnel Stages

```mermaid
stateDiagram-v2
    [*] --> New : Opportunity Created
    New --> Contacted : Initial outreach completed
    Contacted --> Qualified : Budget & interest validated
    Qualified --> Proposal : Proposal/pricing draft submitted
    Proposal --> Closed : Negotiation won / lost
    Closed --> [*]
```

---

## Navigation Structure

```mermaid
graph TD
    Root[Root Layout] --> Sidebar[Sidebar Panel]
    Root --> TopBar[Top Bar Panel]
    Root --> Wrapper[Page Content Wrapper]
    
    Sidebar --> |Navigates| Dash["Dashboard (/)"]
    Sidebar --> |Navigates| Cust["Customers (/customers)"]
    Sidebar --> |Navigates| Leads["Leads (/leads)"]
    Sidebar --> |Navigates| Tasks["Tasks (/tasks)"]
    Sidebar --> |Navigates| Reps["Reports (/reports)"]
    Sidebar --> |Navigates| Sett["Settings (/settings)"]
    
    Wrapper --> Dash
    Wrapper --> Cust
    Wrapper --> Leads
    Wrapper --> Tasks
    Wrapper --> Reps
    Wrapper --> Sett
    
    Cust --> |Click customer row| CustDet["Customer Profile (/customers/[id])"]
    Root -.-> |Connection drop fallback| Offline["Offline Page (/offline)"]
```

---

## Supabase Setup Prerequisites

1. **Create a Supabase Project**:
   - Go to [Supabase Console](https://supabase.com) and click **New Project**.
   - Note down the **Project URL** and the **Anon Key** from the settings panel.
2. **Environment Configuration**:
   - Copy `.env.example` to `.env` in the root workspace folder.
   - Insert the values:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     ```
3. **Database Migration**:
   - In subsequent commits, SQL schema scripts will be available in `/supabase/migrations/` to construct the tables automatically.
