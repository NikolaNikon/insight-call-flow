
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface KeywordTrackerExtended {
  id: string;
  name: string;
  category: string;
  keywords: string[];
  is_active: boolean;
  mentions_count?: number;
  created_at: string;
  updated_at: string;
  org_id: string;
}

interface UseKeywordTrackersApiProps {
  category?: string;
  include_stats?: boolean;
}

export const useKeywordTrackersApi = (props: UseKeywordTrackersApiProps = {}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch trackers with API
  const { data: trackers, isLoading, refetch } = useQuery({
    queryKey: ['keyword-trackers-api', props.category, props.include_stats],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (props.category) params.append('category', props.category);
      if (props.include_stats) params.append('include_stats', 'true');

      const { data, error } = await supabase.functions.invoke('keyword-trackers-api', {
        method: 'GET',
        body: null,
      });

      if (error) throw error;
      return data as KeywordTrackerExtended[];
    }
  });

  // Get unique categories
  const categories = trackers?.reduce((acc, tracker) => {
    const category = tracker.category || 'Общие';
    if (!acc.includes(category)) acc.push(category);
    return acc;
  }, [] as string[]) || [];

  // Create tracker mutation
  const createTrackerMutation = useMutation({
    mutationFn: async (trackerData: Partial<KeywordTrackerExtended>) => {
      const { data, error } = await supabase.functions.invoke('keyword-trackers-api', {
        method: 'POST',
        body: trackerData,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keyword-trackers-api'] });
      queryClient.invalidateQueries({ queryKey: ['keyword-trackers'] });
      toast({
        title: "Успешно",
        description: "Трекер создан"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать трекер",
        variant: "destructive"
      });
    }
  });

  // Update tracker mutation
  const updateTrackerMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<KeywordTrackerExtended> & { id: string }) => {
      const { data, error } = await supabase.functions.invoke(`keyword-trackers-api`, {
        method: 'PATCH',
        body: updates,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keyword-trackers-api'] });
      queryClient.invalidateQueries({ queryKey: ['keyword-trackers'] });
      toast({
        title: "Успешно",
        description: "Трекер обновлен"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить трекер",
        variant: "destructive"
      });
    }
  });

  // Delete tracker mutation
  const deleteTrackerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.functions.invoke(`keyword-trackers-api`, {
        method: 'DELETE',
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keyword-trackers-api'] });
      queryClient.invalidateQueries({ queryKey: ['keyword-trackers'] });
      toast({
        title: "Успешно",
        description: "Трекер удален"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось удалить трекер",
        variant: "destructive"
      });
    }
  });

  // Recalculate mentions mutation
  const recalculateMentionsMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.functions.invoke(`keyword-trackers-api`, {
        method: 'POST',
        body: null,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keyword-trackers-api'] });
      toast({
        title: "Успешно",
        description: "Статистика обновлена"
      });
    }
  });

  return {
    trackers,
    categories,
    isLoading,
    refetch,
    createTracker: createTrackerMutation.mutateAsync,
    updateTracker: updateTrackerMutation.mutateAsync,
    deleteTracker: deleteTrackerMutation.mutateAsync,
    recalculateMentions: recalculateMentionsMutation.mutateAsync,
    isCreating: createTrackerMutation.isPending,
    isUpdating: updateTrackerMutation.isPending,
    isDeleting: deleteTrackerMutation.isPending,
    isRecalculating: recalculateMentionsMutation.isPending,
  };
};
