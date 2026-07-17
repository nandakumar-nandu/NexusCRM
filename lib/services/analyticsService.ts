import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { type Customer } from './customersService';
import { type Lead } from './leadsService';
import { type Task } from './tasksService';

export interface DashboardStats {
  totalCustomers: number;
  openLeadsValue: number;
  tasksDueToday: number;
  winRate: number;
  leadsByStage: { stage: string; value: number; count: number }[];
  newCustomersPerMonth: { month: string; count: number }[];
  taskCompletionRate: { name: string; value: number }[];
  recentActivity: {
    id: string;
    type: 'lead' | 'task' | 'customer';
    title: string;
    subtitle: string;
    timestamp: string;
  }[];
}

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const isBrowser = typeof window !== 'undefined';

function isDemoSandbox(): boolean {
  if (!isBrowser) return false;
  return document.cookie.includes('nexus-demo-session=true');
}

// Sandbox local retrieval helpers
function getSandboxCustomers(): Customer[] {
  if (!isBrowser) return [];
  const cached = localStorage.getItem('nexus-mock-customers');
  return cached ? JSON.parse(cached) : [];
}

function getSandboxLeads(): Lead[] {
  if (!isBrowser) return [];
  const cached = localStorage.getItem('nexus-mock-leads');
  return cached ? JSON.parse(cached) : [];
}

function getSandboxTasks(): Task[] {
  if (!isBrowser) return [];
  const cached = localStorage.getItem('nexus-mock-tasks');
  return cached ? JSON.parse(cached) : [];
}

// Chronological grouping helper for new customers (last 6 months)
function calculateNewCustomersPerMonth(customers: Customer[]) {
  const result: { month: string; count: number }[] = [];
  const today = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    result.push({
      month: MONTHS_SHORT[d.getMonth()],
      count: 0
    });
  }

  customers.forEach(c => {
    if (!c.created_at) return;
    const date = new Date(c.created_at);
    const mName = MONTHS_SHORT[date.getMonth()];
    const entry = result.find(r => r.month === mName);
    if (entry) {
      entry.count += 1;
    }
  });

  return result;
}

// Stage values sum helper for leads
function calculateLeadsByStage(leads: Lead[]) {
  const stages = ['New', 'Contacted', 'Qualified', 'Proposal', 'Closed'];
  return stages.map(stage => {
    const stageLeads = leads.filter(l => l.stage === stage);
    const value = stageLeads.reduce((sum, l) => sum + l.value, 0);
    return {
      stage,
      count: stageLeads.length,
      value
    };
  });
}

// Task completion ratios helper
function calculateTaskCompletionRate(tasks: Task[]) {
  const completed = tasks.filter(t => t.completed).length;
  const pending = tasks.filter(t => !t.completed).length;
  
  // If there are no tasks, present a default empty balance
  if (completed === 0 && pending === 0) {
    return [
      { name: "Completed", value: 0 },
      { name: "Pending", value: 1 }
    ];
  }
  
  return [
    { name: "Completed", value: completed },
    { name: "Pending", value: pending }
  ];
}

// Activity timeline consolidator (combines latest 5 events)
function calculateRecentActivity(customers: Customer[], leads: Lead[], tasks: Task[]) {
  const activityList: DashboardStats['recentActivity'] = [];

  // 1. Map leads creation
  leads.forEach(l => {
    activityList.push({
      id: `act-lead-${l.id}`,
      type: 'lead',
      title: `Opportunity: ${l.title}`,
      subtitle: `Stage changed to ${l.stage} | Value: $${l.value.toLocaleString()}`,
      timestamp: l.created_at || new Date().toISOString()
    });
  });

  // 2. Map tasks creation
  tasks.forEach(t => {
    activityList.push({
      id: `act-task-${t.id}`,
      type: 'task',
      title: `Task: ${t.title}`,
      subtitle: t.completed ? 'Marked Completed' : `Due by ${t.due_date} | Priority: ${t.priority}`,
      timestamp: t.created_at || new Date().toISOString()
    });
  });

  // 3. Map customer profile registration
  customers.forEach(c => {
    activityList.push({
      id: `act-cust-${c.id}`,
      type: 'customer',
      title: `New Account: ${c.name}`,
      subtitle: `${c.company} registered as active ${c.status}`,
      timestamp: c.created_at || new Date().toISOString()
    });
  });

  // Sort by date descending and return top 5
  return activityList
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);
}

export const analyticsService = {
  /**
   * Aggregate all dashboard KPI metrics and Recharts coordinates.
   */
  async getDashboardData(): Promise<DashboardStats> {
    if (isDemoSandbox()) {
      const customers = getSandboxCustomers();
      const leads = getSandboxLeads();
      const tasks = getSandboxTasks();

      // Calculation of stats
      const totalCustomers = customers.length;
      
      const openLeads = leads.filter(l => l.stage !== 'Closed');
      const openLeadsValue = openLeads.reduce((sum, l) => sum + l.value, 0);

      const todayStr = new Date().toISOString().split('T')[0];
      const tasksDueToday = tasks.filter(t => t.due_date === todayStr && !t.completed).length;

      const totalLeads = leads.length;
      const closedLeads = leads.filter(l => l.stage === 'Closed').length;
      const winRate = totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100) : 0;

      return {
        totalCustomers,
        openLeadsValue,
        tasksDueToday,
        winRate,
        leadsByStage: calculateLeadsByStage(leads),
        newCustomersPerMonth: calculateNewCustomersPerMonth(customers),
        taskCompletionRate: calculateTaskCompletionRate(tasks),
        recentActivity: calculateRecentActivity(customers, leads, tasks)
      };
    }

    // --- Production Supabase Queries ---
    const supabase = createBrowserClient();

    // 1. Fetch total customers count
    const { count: customerCount, error: customerErr } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });

    if (customerErr) throw customerErr;

    // 2. Fetch leads to sum values, compute Win Rate and group stages
    const { data: dbLeads, error: leadsErr } = await supabase
      .from('leads')
      .select('*');

    if (leadsErr) throw leadsErr;

    // 3. Fetch incomplete tasks due today
    const todayStr = new Date().toISOString().split('T')[0];
    const { count: tasksDueTodayCount, error: tasksErr } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('due_date', todayStr)
      .eq('completed', false);

    if (tasksErr) throw tasksErr;

    // 4. Fetch tasks to calculate task completion ratios
    const { data: dbTasks, error: dbTasksErr } = await supabase
      .from('tasks')
      .select('*');

    if (dbTasksErr) throw dbTasksErr;

    // 5. Fetch customers list for monthly timeline metrics
    const { data: dbCustomers, error: dbCustErr } = await supabase
      .from('customers')
      .select('*');

    if (dbCustErr) throw dbCustErr;

    // Perform server-side result mappings
    const typedLeads = (dbLeads || []) as Lead[];
    const typedTasks = (dbTasks || []) as Task[];
    const typedCustomers = (dbCustomers || []) as Customer[];

    const openLeads = typedLeads.filter(l => l.stage !== 'Closed');
    const openLeadsValue = openLeads.reduce((sum, l) => sum + l.value, 0);

    const totalLeads = typedLeads.length;
    const closedLeads = typedLeads.filter(l => l.stage === 'Closed').length;
    const winRate = totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100) : 0;

    return {
      totalCustomers: customerCount || 0,
      openLeadsValue,
      tasksDueToday: tasksDueTodayCount || 0,
      winRate,
      leadsByStage: calculateLeadsByStage(typedLeads),
      newCustomersPerMonth: calculateNewCustomersPerMonth(typedCustomers),
      taskCompletionRate: calculateTaskCompletionRate(typedTasks),
      recentActivity: calculateRecentActivity(typedCustomers, typedLeads, typedTasks)
    };
  }
};
