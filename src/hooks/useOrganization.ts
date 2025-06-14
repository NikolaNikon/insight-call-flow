
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useImpersonateOrg } from './useImpersonateOrg';
import { useUserRole } from './useUserRole';

export const useOrganization = () => {
  const { orgId } = useImpersonateOrg();
  const { isSuperAdmin } = useUserRole();

  const { data: organization, isLoading } = useQuery({
    queryKey: ['current-organization', orgId],
    queryFn: async () => {
      if (isSuperAdmin && orgId) {
        // Суперадмин работает с выбранной организацией
        const { data: org, error } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', orgId)
          .single();
        if (error) {
          console.error('Error (superadmin):', error);
          return null;
        }
        return org || null;
      }
      // Стандартная ветка — обычный пользователь
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          org_id,
          organizations!inner(
            id,
            name,
            subdomain,
            settings,
            is_active
          )
        `)
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Error fetching user organization:', userError);
        return null;
      }

      return userData?.organizations || null;
    },
    enabled: true
  });

  return {
    organization,
    isLoading
  };
};
