import { createClient as createBrowserClient } from '@/lib/supabase/client';

export type UserRole = 'admin' | 'manager' | 'viewer';

const isBrowser = typeof window !== 'undefined';

function isDemoSandbox(): boolean {
  if (!isBrowser) return false;
  return document.cookie.includes('nexus-demo-session=true');
}

export const roleService = {
  /**
   * Retrieve the current user's security role level.
   */
  async getUserRole(): Promise<UserRole> {
    if (isDemoSandbox()) {
      if (isBrowser) {
        const storedRole = localStorage.getItem('nexus-user-role') as UserRole;
        if (storedRole) return storedRole;
        // Default to admin for offline sandbox testing
        localStorage.setItem('nexus-user-role', 'admin');
        return 'admin';
      }
      return 'admin';
    }

    try {
      const supabase = createBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 'viewer';

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If role doesn't exist, create default role mapping as 'viewer'
        await supabase
          .from('user_roles')
          .upsert({ user_id: user.id, role: 'viewer' });
        return 'viewer';
      }

      return data.role as UserRole;
    } catch (err) {
      console.error("Failed to fetch user security role level:", err);
      return 'viewer';
    }
  },

  /**
   * Assign or update user's security role.
   */
  async setUserRole(role: UserRole): Promise<void> {
    if (isDemoSandbox()) {
      if (isBrowser) {
        localStorage.setItem('nexus-user-role', role);
        // Fire custom event to notify components
        window.dispatchEvent(new Event('role-change'));
      }
      return;
    }

    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No active user session found");

    const { error } = await supabase
      .from('user_roles')
      .upsert({ user_id: user.id, role });

    if (error) throw error;
    
    if (isBrowser) {
      window.dispatchEvent(new Event('role-change'));
    }
  }
};
