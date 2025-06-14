
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './useOrganization';

const getTelfinCalls = async (orgId: string) => {
  const { data, error } = await supabase
    .from('telfin_calls')
    .select('*')
    .eq('org_id', orgId)
    .order('start_time', { ascending: false });

  if (error) {
    throw error;
  }
  return data;
};

export const useTelfinCalls = () => {
  const { organization } = useOrganization();
  const orgId = organization?.id;

  return useQuery({
    queryKey: ['telfin_calls', orgId],
    queryFn: () => getTelfinCalls(orgId!),
    enabled: !!orgId,
  });
};
