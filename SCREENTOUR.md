# NexusCRM - Screen Tour & Navigation Map

This tour describes the layout screens available in this initial scaffold version of NexusCRM.

---

## Screen Inventory & Paths

1. **Dashboard Overview (`/`)**
   - **Main Display**: General summary stats, recent pipeline logs list, conversion indicators.
   - **Primary Action**: "New Lead" button.

2. **Customers Directory (`/customers`)**
   - **Main Display**: Interactive listings table displaying client names, corporate accounts, contacts, and status indicators.
   - **Primary Action**: "Add Customer" button, search bar, and filter buttons.

3. **Leads Kanban Board (`/leads`)**
   - **Main Display**: Columns for deal stages (New, Contacted, Proposal, Negotiation) filled with individual opportunity cards (value, client, due date).
   - **Primary Action**: "Create Deal" button and column-specific card insertions.

4. **Tasks Checklist (`/tasks`)**
   - **Main Display**: Action items table showing checkbox status, linked client accounts, deadlines, and urgency level indicators.
   - **Primary Action**: "New Task" button and tab filter buttons.

5. **Reports & Analytics (`/reports`)**
   - **Main Display**: Bar charts reflecting monthly revenue progression and category breakdowns.
   - **Primary Action**: Custom date selector dropdown.

6. **Settings Configuration (`/settings`)**
   - **Main Display**: Profile parameters forms, active database connection markers, security access profiles.
   - **Primary Action**: Left-hand tab switcher and "Save Changes" action.

---

## Screen Navigation Map

```mermaid
graph TD
    UserApp[User Session] --> RootLayout[Root App Layout]
    
    RootLayout --> Sidebar[Sidebar Panel]
    RootLayout --> Page[Page Viewer]
    
    Sidebar -->|Navigate| P1[Dashboard Page: "/"]
    Sidebar -->|Navigate| P2[Customers Page: "/customers"]
    Sidebar -->|Navigate| P3[Leads Page: "/leads"]
    Sidebar -->|Navigate| P4[Tasks Page: "/tasks"]
    Sidebar -->|Navigate| P5[Reports Page: "/reports"]
    Sidebar -->|Navigate| P6[Settings Page: "/settings"]
    
    P1 -->|Add Lead| P3
    P2 -->|Select Account| P4
    P3 -->|Schedule follow-up| P4
    P5 -->|Check trends| P1
```
