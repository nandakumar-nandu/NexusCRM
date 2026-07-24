import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { Customer } from './customersService';

export interface Lead {
  id: string;
  title: string;
  customer_id: string;
  value: number;
  stage: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Closed';
  probability: number;
  expected_close_date: string;
  notes?: string;
  created_by?: string;
  created_at?: string;
  customer?: Customer; // Nested profile reference
}

// Default mock leads for sandbox mode
const DEFAULT_MOCK_LEADS = (customersList: Customer[]): Lead[] => {
  const c1 = customersList.find(c => c.id === "1") || customersList[0];
  const c2 = customersList.find(c => c.id === "2") || customersList[1] || c1;
  const c3 = customersList.find(c => c.id === "3") || customersList[2] || c1;
  const c4 = customersList.find(c => c.id === "4") || customersList[3] || c1;

  return [
    {
      id: "l1",
      title: "Enterprise CRM Integration",
      customer_id: c1?.id || "1",
      value: 25000.00,
      stage: "New",
      probability: 30,
      expected_close_date: "2026-08-30",
      notes: "Acme Corp is evaluating dynamic workspace custom solutions. Contact representative next Tuesday.",
      created_at: new Date().toISOString(),
      customer: c1
    },
    {
      id: "l2",
      title: "Cloud Migration Project",
      customer_id: c2?.id || "2",
      value: 13000.00,
      stage: "Contacted",
      probability: 50,
      expected_close_date: "2026-09-15",
      notes: "Reviewing hosting sizing sheets for Starlight Media assets.",
      created_at: new Date().toISOString(),
      customer: c2
    },
    {
      id: "l3",
      title: "SaaS Licensing Deal",
      customer_id: c3?.id || "3",
      value: 45000.00,
      stage: "Proposal",
      probability: 70,
      expected_close_date: "2026-08-10",
      notes: "Nexus Labs legal teams are reviewing subscription license drafts.",
      created_at: new Date().toISOString(),
      customer: c3
    },
    {
      id: "l4",
      title: "Global ERP Rollout",
      customer_id: c4?.id || "4",
      value: 85000.00,
      stage: "Qualified",
      probability: 60,
      expected_close_date: "2026-11-20",
      notes: "Velocity Group migration blueprint finalized. Budget approved.",
      created_at: new Date().toISOString(),
      customer: c4
    }
  ];
};

const isBrowser = typeof window !== 'undefined';

function isDemoSandbox(): boolean {
  if (!isBrowser) return false;
  return document.cookie.includes('nexus-demo-session=true');
}

/**
 * Retrieve list of customers (mock sandbox mode helper)
 */
function getSandboxCustomers(): Customer[] {
  if (!isBrowser) return [];
  const cached = localStorage.getItem('nexus-mock-customers');
  return cached ? JSON.parse(cached) : [];
}

/**
 * Retrieve sandbox leads list
 */
function getMockLeads(): Lead[] {
  if (!isBrowser) return [];
  
  const cached = localStorage.getItem('nexus-mock-leads');
  const customers = getSandboxCustomers();
  
  if (!cached) {
    const list = DEFAULT_MOCK_LEADS(customers);
    localStorage.setItem('nexus-mock-leads', JSON.stringify(list));
    return list;
  }
  
  const parsed: Lead[] = JSON.parse(cached);
  return parsed.map(lead => ({
    ...lead,
    customer: customers.find(c => c.id === lead.customer_id) || lead.customer
  }));
}

/**
 * Save sandbox leads list
 */
function saveMockLeads(leads: Lead[]) {
  if (isBrowser) {
    localStorage.setItem('nexus-mock-leads', JSON.stringify(leads));
  }
}

export const leadsService = {
  /**
   * Fetch all pipeline leads, including associated customer metadata.
   */
  async getLeads(): Promise<Lead[]> {
    if (isDemoSandbox()) {
      return getMockLeads();
    }

    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('leads')
      .select('*, customer:customers(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return ((data || []) as unknown as Lead[]).map((lead) => ({
      ...lead,
      customer: lead.customer
    }));
  },

  /**
   * Retrieve a single lead deal record by ID.
   */
  async getLead(id: string): Promise<Lead | undefined> {
    const leads = await this.getLeads();
    return leads.find((l) => l.id === id);
  },

  /**
   * Create a new sales lead.
   */
  async createLead(lead: Omit<Lead, 'id' | 'created_at' | 'customer'>): Promise<Lead> {
    if (isDemoSandbox()) {
      const list = getMockLeads();
      const customers = getSandboxCustomers();
      const clientProfile = customers.find(c => c.id === lead.customer_id);
      
      const newLead: Lead = {
        ...lead,
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        customer: clientProfile
      };
      
      saveMockLeads([newLead, ...list]);
      return newLead;
    }

    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('leads')
      .insert([{
        ...lead,
        created_by: user?.id
      }])
      .select('*, customer:customers(*)')
      .single();

    if (error) throw error;
    
    return {
      ...data,
      customer: data.customer as Customer
    } as Lead;
  },

  /**
   * Update lead values, stages, or descriptions.
   */
  async updateLead(id: string, lead: Partial<Lead>): Promise<Lead> {
    if (isDemoSandbox()) {
      const list = getMockLeads();
      let updated: Lead | null = null;
      
      const updatedList = list.map(l => {
        if (l.id === id) {
          const customers = getSandboxCustomers();
          const customerId = lead.customer_id || l.customer_id;
          const clientProfile = customers.find(c => c.id === customerId);
          
          updated = {
            ...l,
            ...lead,
            customer: clientProfile || l.customer
          } as Lead;
          return updated;
        }
        return l;
      });

      if (!updated) throw new Error("Lead not found");
      saveMockLeads(updatedList);
      return updated;
    }

    const supabase = createBrowserClient();
    const dbPayload = { ...lead };
    delete dbPayload.customer;

    const { data, error } = await supabase
      .from('leads')
      .update(dbPayload)
      .eq('id', id)
      .select('*, customer:customers(*)')
      .single();

    if (error) throw error;
    
    return {
      ...data,
      customer: data.customer as Customer
    } as Lead;
  },

  /**
   * Delete a sales lead.
   */
  async deleteLead(id: string): Promise<void> {
    if (isDemoSandbox()) {
      const list = getMockLeads();
      const filtered = list.filter(l => l.id !== id);
      saveMockLeads(filtered);
      return;
    }

    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
