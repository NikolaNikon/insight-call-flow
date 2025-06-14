import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type UpsertTelfinConnection = Database['public']['Tables']['telfin_connections']['Insert'];

export const getTelfinConnection = async (orgId: string) => {
  const { data, error } = await supabase
    .from('telfin_connections')
    .select('*')
    .eq('org_id', orgId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
    throw error;
  }
  return data;
};

export const saveTelfinConnection = async (connection: UpsertTelfinConnection) => {
  const { data, error } = await supabase
    .from('telfin_connections')
    .upsert(connection)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
};

export const getPendingTelfinCalls = async (orgId: string) => {
  const { data, error } = await supabase
    .from('telfin_calls')
    .select('*')
    .eq('org_id', orgId)
    .eq('processing_status', 'pending')
    .eq('has_record', true);

  if (error) {
    throw error;
  }
  return data;
};
