
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './useOrganization';

export interface OrgMetric {
  id: string;
  org_id: string;
  metric_name: string;
  current_value: number;
  target_value?: number;
  unit: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useOrgMetrics = () => {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['org-metrics', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];

      const { data, error } = await supabase
        .from('org_metrics')
        .select('*')
        .eq('org_id', organization.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as OrgMetric[];
    },
    enabled: !!organization?.id
  });

  const { data: nsmMetric } = useQuery({
    queryKey: ['nsm-metric', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return null;

      const { data, error } = await supabase
        .from('org_metrics')
        .select('*')
        .eq('org_id', organization.id)
        .eq('metric_name', 'average_call_score')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as OrgMetric | null;
    },
    enabled: !!organization?.id
  });

  const createMetricMutation = useMutation({
    mutationFn: async (metric: Omit<OrgMetric, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('org_metrics')
        .insert(metric)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['nsm-metric'] });
    }
  });

  const updateMetricMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OrgMetric> & { id: string }) => {
      const { data, error } = await supabase
        .from('org_metrics')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['nsm-metric'] });
    }
  });

  const initializeNSM = async () => {
    if (!organization?.id || nsmMetric) return;

    // Инициализируем NSM метрику
    await createMetricMutation.mutateAsync({
      org_id: organization.id,
      metric_name: 'average_call_score',
      current_value: 0,
      target_value: 5,
      unit: 'score',
      is_active: true
    });
  };

  return {
    metrics,
    nsmMetric,
    isLoading,
    createMetric: createMetricMutation.mutateAsync,
    updateMetric: updateMetricMutation.mutateAsync,
    initializeNSM,
    isCreating: createMetricMutation.isPending,
    isUpdating: updateMetricMutation.isPending
  };
};
