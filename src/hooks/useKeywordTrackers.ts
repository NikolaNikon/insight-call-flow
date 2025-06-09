
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './useOrganization';

export interface KeywordTracker {
  id: string;
  org_id: string;
  name: string;
  keywords: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface KeywordMatch {
  id: string;
  call_id: string;
  tracker_id: string;
  matched_keywords: string[];
  match_count: number;
  detected_at: string;
}

export const useKeywordTrackers = () => {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();

  const { data: trackers, isLoading } = useQuery({
    queryKey: ['keyword-trackers', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];

      const { data, error } = await supabase
        .from('keyword_trackers')
        .select('*')
        .eq('org_id', organization.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as KeywordTracker[];
    },
    enabled: !!organization?.id
  });

  const { data: topTrackers } = useQuery({
    queryKey: ['top-keyword-trackers', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];

      // Получаем топ-3 трекера по количеству совпадений за последние 7 дней
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('call_keywords')
        .select(`
          tracker_id,
          match_count,
          keyword_trackers!inner(
            id,
            name,
            keywords
          )
        `)
        .gte('detected_at', sevenDaysAgo.toISOString())
        .order('match_count', { ascending: false })
        .limit(3);

      if (error) throw error;

      // Агрегируем данные по трекерам
      const aggregated = data.reduce((acc: any[], item) => {
        const existing = acc.find(t => t.tracker_id === item.tracker_id);
        if (existing) {
          existing.total_matches += item.match_count;
        } else {
          acc.push({
            tracker_id: item.tracker_id,
            name: item.keyword_trackers.name,
            keywords: item.keyword_trackers.keywords,
            total_matches: item.match_count,
            trend: 'stable' // TODO: Рассчитать тренд
          });
        }
        return acc;
      }, []);

      return aggregated.slice(0, 3);
    },
    enabled: !!organization?.id
  });

  const createTrackerMutation = useMutation({
    mutationFn: async (tracker: Omit<KeywordTracker, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('keyword_trackers')
        .insert(tracker)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keyword-trackers'] });
      queryClient.invalidateQueries({ queryKey: ['top-keyword-trackers'] });
    }
  });

  const updateTrackerMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<KeywordTracker> & { id: string }) => {
      const { data, error } = await supabase
        .from('keyword_trackers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keyword-trackers'] });
      queryClient.invalidateQueries({ queryKey: ['top-keyword-trackers'] });
    }
  });

  const deleteTrackerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('keyword_trackers')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keyword-trackers'] });
      queryClient.invalidateQueries({ queryKey: ['top-keyword-trackers'] });
    }
  });

  return {
    trackers,
    topTrackers,
    isLoading,
    createTracker: createTrackerMutation.mutateAsync,
    updateTracker: updateTrackerMutation.mutateAsync,
    deleteTracker: deleteTrackerMutation.mutateAsync,
    isCreating: createTrackerMutation.isPending,
    isUpdating: updateTrackerMutation.isPending,
    isDeleting: deleteTrackerMutation.isPending
  };
};
