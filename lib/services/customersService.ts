import { createClient as createBrowserClient } from '@/lib/supabase/client';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'Active' | 'Inactive' | 'Lead';
  tags: string[];
  notes: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

// Default initial seed data for demo sandbox mode
const DEFAULT_MOCK_CUSTOMERS: Customer[] = [
  { id: "1", name: "Sarah Jenkins", company: "Acme Corp", email: "sarah.j@acme.com", phone: "+1 (555) 123-4567", status: "Active", tags: ["Enterprise", "Tech"], notes: "Initial consulting discussion finished. Follow up next week.", created_at: "2026-01-12T00:00:00Z", updated_at: "2026-01-12T00:00:00Z" },
  { id: "2", name: "David Miller", company: "Starlight Media", email: "david@starlight.io", phone: "+1 (555) 987-6543", status: "Active", tags: ["Media", "Design"], notes: "Reviewing layout proposal for Starlight website project.", created_at: "2026-02-18T00:00:00Z", updated_at: "2026-02-18T00:00:00Z" },
  { id: "3", name: "Elena Rostova", company: "Nexus Labs", email: "elena@nexuslabs.co", phone: "+1 (555) 456-7890", status: "Inactive", tags: ["Research", "Healthcare"], notes: "Pending legal team feedback on contract provisions.", created_at: "2026-03-03T00:00:00Z", updated_at: "2026-03-03T00:00:00Z" },
  { id: "4", name: "Marcus Chen", company: "Velocity Group", email: "marcus.c@velocity.com", phone: "+1 (555) 234-5678", status: "Active", tags: ["Enterprise"], notes: "Schedule system integration requirements meeting.", created_at: "2026-04-22T00:00:00Z", updated_at: "2026-04-22T00:00:00Z" },
  { id: "5", name: "Jessica Taylor", company: "Clarity Design", email: "jessica@clarity.design", phone: "+1 (555) 876-5432", status: "Lead", tags: ["Tech", "Design"], notes: "Met at design conference. Inquired about enterprise CRM tools.", created_at: "2026-05-15T00:00:00Z", updated_at: "2026-05-15T00:00:00Z" }
];

// In-memory fallback if localStorage is not accessible (server-side rendering context)
let inMemoryCustomers: Customer[] = [...DEFAULT_MOCK_CUSTOMERS];

const isBrowser = typeof window !== 'undefined';

/**
 * Check if the application is running in sandbox demo mode
 */
export function isDemoSandbox(): boolean {
  if (!isBrowser) return false;
  return document.cookie.includes('nexus-demo-session=true');
}

/**
 * Retrieve and synchronize cached mock customer tables
 */
function getMockCustomers(): Customer[] {
  if (!isBrowser) return inMemoryCustomers;
  
  const cached = localStorage.getItem('nexus-mock-customers');
  if (!cached) {
    localStorage.setItem('nexus-mock-customers', JSON.stringify(DEFAULT_MOCK_CUSTOMERS));
    return DEFAULT_MOCK_CUSTOMERS;
  }
  return JSON.parse(cached);
}

/**
 * Update cached mock customer lists
 */
function saveMockCustomers(customers: Customer[]) {
  if (isBrowser) {
    localStorage.setItem('nexus-mock-customers', JSON.stringify(customers));
  } else {
    inMemoryCustomers = customers;
  }
}

/**
 * Customers Database Service
 * 
 * Provides unified CRUD hooks that direct requests to either the live
 * Supabase client backend or the local storage sandbox simulator depending on auth status.
 */
export const customersService = {
  /**
   * Retrieve a single customer record by ID.
   */
  async getCustomer(id: string): Promise<Customer> {
    if (isDemoSandbox()) {
      const list = getMockCustomers();
      const record = list.find(c => c.id === id);
      if (!record) throw new Error("Customer not found");
      return record;
    }

    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Customer;
  },

  /**
   * Fetch a paginated, searched, and filtered list of customers.
   * 
   * @param page - Current active index page (starts at 1)
   * @param search - Search term (matches name, company or email)
   * @param status - Filter state ('All' or status criteria)
   * @param limit - Page size limit (defaults to 10)
   */
  async getCustomers(page: number, search: string, status: string, limit: number = 10): Promise<{ data: Customer[]; count: number }> {
    if (isDemoSandbox()) {
      let list = getMockCustomers();

      // Apply Search Filter (name, company, or email, case insensitive)
      if (search) {
        const query = search.toLowerCase();
        list = list.filter(c => 
          c.name.toLowerCase().includes(query) || 
          c.email.toLowerCase().includes(query) ||
          c.company.toLowerCase().includes(query)
        );
      }

      // Apply Status Filter
      if (status && status !== 'All') {
        list = list.filter(c => c.status.toLowerCase() === status.toLowerCase());
      }

      // Calculate totals
      const count = list.length;

      // Apply Pagination
      const start = (page - 1) * limit;
      const end = start + limit;
      const data = list.slice(start, end);

      return { data, count };
    }

    // --- Supabase Live Integration ---
    const supabase = createBrowserClient();
    
    // Base query setup
    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' });

    // Apply Search
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`);
    }

    // Apply Status
    if (status && status !== 'All') {
      query = query.eq('status', status);
    }

    // Apply Pagination limits
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: (data as Customer[]) || [],
      count: count || 0
    };
  },

  /**
   * Create a new customer profile.
   */
  async createCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    if (isDemoSandbox()) {
      const list = getMockCustomers();
      const newCustomer: Customer = {
        ...customer,
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      saveMockCustomers([newCustomer, ...list]);
      return newCustomer;
    }

    // --- Supabase Live Integration ---
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('customers')
      .insert([{ 
        ...customer, 
        created_by: user?.id 
      }])
      .select()
      .single();

    if (error) throw error;
    return data as Customer;
  },

  /**
   * Update an existing customer profile.
   */
  async updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer> {
    if (isDemoSandbox()) {
      const list = getMockCustomers();
      let updatedRecord: Customer | null = null;
      
      const updatedList = list.map(c => {
        if (c.id === id) {
          updatedRecord = {
            ...c,
            ...customer,
            updated_at: new Date().toISOString()
          } as Customer;
          return updatedRecord;
        }
        return c;
      });

      if (!updatedRecord) throw new Error("Customer not found");
      saveMockCustomers(updatedList);
      return updatedRecord;
    }

    // --- Supabase Live Integration ---
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('customers')
      .update({
        ...customer,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Customer;
  },

  /**
   * Delete a customer profile.
   */
  async deleteCustomer(id: string): Promise<void> {
    if (isDemoSandbox()) {
      const list = getMockCustomers();
      const filtered = list.filter(c => c.id !== id);
      saveMockCustomers(filtered);
      return;
    }

    // --- Supabase Live Integration ---
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
