
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useImpersonateOrg } from './useImpersonateOrg';
import { useUserRole } from './useUserRole';

export const useOrganization = () => {
  const { orgId, setOrgId } = useImpersonateOrg();
  const { isSuperAdmin } = useUserRole();

  const { data: organization, isLoading } = useQuery({
    queryKey: ['current-organization', orgId, isSuperAdmin],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      if (isSuperAdmin) {
        // Для суперадмина: используем выбранную организацию или автоматически выбираем первую доступную
        if (orgId) {
          const { data: org, error } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', orgId)
            .single();
          if (error) {
            console.error('Error fetching selected org:', error);
            return null;
          }
          return org;
        } else {
          // Автоматически выбираем первую доступную организацию для суперадмина
          const { data: orgs, error } = await supabase
            .from('organizations')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: true })
            .limit(1);
          
          if (error) {
            console.error('Error fetching orgs for superadmin:', error);
            return null;
          }
          
          if (orgs && orgs.length > 0) {
            // Автоматически устанавливаем первую организацию
            setOrgId(orgs[0].id);
            return orgs[0];
          }
          return null;
        }
      }

      // Стандартная ветка — обычный пользователь
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
