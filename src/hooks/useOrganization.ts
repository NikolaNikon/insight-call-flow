
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useOrganization = () => {
  const { user } = useAuth();

  const { data: organization, isLoading, error } = useQuery({
    queryKey: ['current-organization', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('useOrganization: No user, returning null');
        return null;
      }

      console.log('useOrganization: Fetching organization for user:', user.id);

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

      console.log('useOrganization: Found organization:', userData?.organizations?.name);
      return userData?.organizations || null;
    },
    enabled: !!user
  });

  return {
    organization,
    isLoading,
    error
  };
};
