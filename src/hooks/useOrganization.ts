
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useOrganization = () => {
  const { data: organization, isLoading, error } = useQuery({
    queryKey: ['current-organization'],
    queryFn: async () => {
      console.log('useOrganization: Fetching user...');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('useOrganization: No user found');
        return null;
      }

      console.log('useOrganization: User found:', user.email);

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
        console.error('useOrganization: Error fetching user organization:', userError);
        return null;
      }

      console.log('useOrganization: Organization data:', userData?.organizations);
      return userData?.organizations || null;
    },
    enabled: true
  });

  console.log('useOrganization hook result:', { organization, isLoading, error });

  return {
    organization,
    isLoading,
    error
  };
};
