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
| **Dashboard Metrics** | Consolidated view of customer counts, active leads, tasks, and sales value. | 🚧 UI Scaffold (Static Mock) |
| **Customer Directory** | A central repository for company accounts, email records, and phones. | 🚧 UI Scaffold (Static Mock) |
| **Leads Kanban Board** | Visual board organizing deals by sales stages (New, Proposal, Negotiation). | 🚧 UI Scaffold (Static Mock) |
| **Task Scheduler** | Focus-oriented tracker for pending tasks, alerts, and customer check-ins. | 🚧 UI Scaffold (Static Mock) |
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
