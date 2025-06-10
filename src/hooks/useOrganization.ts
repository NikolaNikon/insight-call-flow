
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useOrganization = () => {
  const { data: organization, isLoading } = useQuery({
    queryKey: ['current-organization'],
    queryFn: async () => {
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
