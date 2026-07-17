import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { type Customer } from './customersService';
import { type Lead } from './leadsService';

export interface Task {
  id: string;
  title: string;
  customer_id: string;
  lead_id: string | null;
  due_date: string;
  priority: 'Low' | 'Medium' | 'High';
  completed: boolean;
  created_by?: string;
  created_at?: string;
  customer?: Customer;
  lead?: Lead;
}

export interface CustomerNote {
  id: string;
  customer_id: string;
  content: string;
  created_by?: string;
  created_at?: string;
}

const DEFAULT_MOCK_TASKS = (customersList: Customer[], leadsList: Lead[]): Task[] => {
  const c1 = customersList.find(c => c.id === "1") || customersList[0];
  const c2 = customersList.find(c => c.id === "2") || customersList[1] || c1;
  const c3 = customersList.find(c => c.id === "3") || customersList[2] || c1;
  const l1 = leadsList.find(l => l.id === "l1") || leadsList[0];
  const l2 = leadsList.find(l => l.id === "l2") || leadsList[1] || l1;

  // Set one task as overdue (e.g. yesterday)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 2);
  const overdueDate = yesterday.toISOString().split('T')[0];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = tomorrow.toISOString().split('T')[0];

  return [
    {
      id: "t1",
      title: "Send revised proposal to Stark Industries",
      customer_id: c1?.id || "1",
      lead_id: l1?.id || "l1",
      due_date: tomorrowDate,
      priority: "High",
      completed: false,
      customer: c1,
      lead: l1
    },
    {
      id: "t2",
      title: "Follow up call with David Miller",
      customer_id: c2?.id || "2",
      lead_id: l2?.id || "l2",
      due_date: overdueDate,
      priority: "Medium",
      completed: false,
      customer: c2,
      lead: l2
    },
    {
      id: "t3",
      title: "Draft contract terms for Tyrell Corp",
      customer_id: c3?.id || "3",
      lead_id: null,
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: "High",
      completed: false,
      customer: c3
    },
    {
      id: "t4",
      title: "Schedule internal review for Wayne Enterprises",
      customer_id: c1?.id || "1",
      lead_id: null,
      due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: "Low",
      completed: true,
      customer: c1
    }
  ];
};

const DEFAULT_MOCK_NOTES = (): CustomerNote[] => {
  return [
    {
      id: "n1",
      customer_id: "1",
      content: "Initial consulting discussion finished. Sarah was receptive to the integration blueprints.",
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "n2",
      customer_id: "1",
      content: "Sent dynamic workspace CRM custom solutions document.",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "n3",
      customer_id: "2",
      content: "Discussed server migrations budget parameters. Expects proposals early next month.",
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
};

const isBrowser = typeof window !== 'undefined';

function isDemoSandbox(): boolean {
  if (!isBrowser) return false;
  return document.cookie.includes('nexus-demo-session=true');
}

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

function getMockTasks(): Task[] {
  if (!isBrowser) return [];
  const cached = localStorage.getItem('nexus-mock-tasks');
  const customers = getSandboxCustomers();
  const leads = getSandboxLeads();

  if (!cached) {
    const list = DEFAULT_MOCK_TASKS(customers, leads);
    localStorage.setItem('nexus-mock-tasks', JSON.stringify(list));
    return list;
  }

  const parsed: Task[] = JSON.parse(cached);
  return parsed.map(task => ({
    ...task,
    customer: customers.find(c => c.id === task.customer_id) || task.customer,
    lead: leads.find(l => l.id === task.lead_id) || task.lead
  }));
}

function saveMockTasks(tasks: Task[]) {
  if (isBrowser) {
    localStorage.setItem('nexus-mock-tasks', JSON.stringify(tasks));
  }
}

function getMockNotes(): CustomerNote[] {
  if (!isBrowser) return [];
  const cached = localStorage.getItem('nexus-mock-notes');
  if (!cached) {
    const list = DEFAULT_MOCK_NOTES();
    localStorage.setItem('nexus-mock-notes', JSON.stringify(list));
    return list;
  }
  return JSON.parse(cached);
}

function saveMockNotes(notes: CustomerNote[]) {
  if (isBrowser) {
    localStorage.setItem('nexus-mock-notes', JSON.stringify(notes));
  }
}

export const tasksService = {
  /**
   * Fetch all tasks, including joined customers and leads metadata.
   */
  async getTasks(): Promise<Task[]> {
    if (isDemoSandbox()) {
      return getMockTasks();
    }

    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('tasks')
      .select('*, customer:customers(*), lead:leads(*)')
      .order('due_date', { ascending: true });

    if (error) throw error;

    return ((data || []) as unknown as Task[]).map(t => ({
      ...t,
      customer: t.customer,
      lead: t.lead
    }));
  },

  /**
   * Create a new task.
   */
  async createTask(task: Omit<Task, 'id' | 'created_at' | 'customer' | 'lead'>): Promise<Task> {
    if (isDemoSandbox()) {
      const list = getMockTasks();
      const customers = getSandboxCustomers();
      const leads = getSandboxLeads();
      const customer = customers.find(c => c.id === task.customer_id);
      const lead = leads.find(l => l.id === task.lead_id);

      const newTask: Task = {
        ...task,
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        customer,
        lead
      };

      saveMockTasks([newTask, ...list]);
      return newTask;
    }

    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        ...task,
        created_by: user?.id
      }])
      .select('*, customer:customers(*), lead:leads(*)')
      .single();

    if (error) throw error;
    return data as Task;
  },

  /**
   * Update a task.
   */
  async updateTask(id: string, task: Partial<Task>): Promise<Task> {
    if (isDemoSandbox()) {
      const list = getMockTasks();
      let updated: Task | null = null;

      const updatedList = list.map(t => {
        if (t.id === id) {
          const customers = getSandboxCustomers();
          const leads = getSandboxLeads();
          const customerId = task.customer_id || t.customer_id;
          const leadId = task.lead_id !== undefined ? task.lead_id : t.lead_id;

          updated = {
            ...t,
            ...task,
            customer: customers.find(c => c.id === customerId) || t.customer,
            lead: leads.find(l => l.id === leadId) || t.lead
          } as Task;
          return updated;
        }
        return t;
      });

      if (!updated) throw new Error("Task not found");
      saveMockTasks(updatedList);
      return updated;
    }

    const supabase = createBrowserClient();
    const dbPayload = { ...task };
    delete dbPayload.customer;
    delete dbPayload.lead;

    const { data, error } = await supabase
      .from('tasks')
      .update(dbPayload)
      .eq('id', id)
      .select('*, customer:customers(*), lead:leads(*)')
      .single();

    if (error) throw error;
    return data as Task;
  },

  /**
   * Delete a task.
   */
  async deleteTask(id: string): Promise<void> {
    if (isDemoSandbox()) {
      const list = getMockTasks();
      const filtered = list.filter(t => t.id !== id);
      saveMockTasks(filtered);
      return;
    }

    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Retrieve all notes linked to a specific customer.
   */
  async getCustomerNotes(customerId: string): Promise<CustomerNote[]> {
    if (isDemoSandbox()) {
      const list = getMockNotes();
      return list.filter(n => n.customer_id === customerId).sort((a, b) => {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
    }

    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('customer_notes')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as CustomerNote[];
  },

  /**
   * Create a new note on a customer profile.
   */
  async createCustomerNote(note: Omit<CustomerNote, 'id' | 'created_at'>): Promise<CustomerNote> {
    if (isDemoSandbox()) {
      const list = getMockNotes();
      const newNote: CustomerNote = {
        ...note,
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      };

      saveMockNotes([newNote, ...list]);
      return newNote;
    }

    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('customer_notes')
      .insert([{
        ...note,
        created_by: user?.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data as CustomerNote;
  }
};
