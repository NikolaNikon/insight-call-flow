
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
      const url = new URL(`${supabase.supabaseUrl}/functions/v1/keyword-trackers-api`);
      
      if (props.category) {
        url.searchParams.append('category', props.category);
      }
      if (props.include_stats) {
        url.searchParams.append('include_stats', 'true');
      }

      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': supabase.supabaseKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch trackers: ${response.statusText}`);
      }

      return response.json() as KeywordTrackerExtended[];
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
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;

      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/keyword-trackers-api`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': supabase.supabaseKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trackerData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create tracker: ${response.statusText}`);
      }

      return response.json();
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
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;

      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/keyword-trackers-api/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': supabase.supabaseKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update tracker: ${response.statusText}`);
      }

      return response.json();
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
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;

      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/keyword-trackers-api/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': supabase.supabaseKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete tracker: ${response.statusText}`);
      }

      return response.json();
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
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;

      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/keyword-trackers-api/${id}/recalculate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': supabase.supabaseKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to recalculate mentions: ${response.statusText}`);
      }

      return response.json();
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
