
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './useOrganization';

export interface CallVolumeData {
  date: string;
  count: number;
}

export interface ManagerRating {
  manager_id: string;
  manager_name: string;
  average_score: number;
  call_count: number;
}

export interface TeamActivity {
  active_managers: number;
  average_duration: number;
  total_calls_today: number;
}

export const useDashboardData = () => {
  const { organization } = useOrganization();

  const { data: callVolumeData, isLoading: isLoadingVolume } = useQuery({
    queryKey: ['call-volume', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('calls')
        .select('date')
        .eq('org_id', organization.id)
        .gte('date', sevenDaysAgo.toISOString())
        .order('date', { ascending: true });

      if (error) throw error;

      // Группируем по дням
      const volumeByDate = data.reduce((acc: Record<string, number>, call) => {
        const date = new Date(call.date).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(volumeByDate).map(([date, count]) => ({
        date,
        count
      })) as CallVolumeData[];
    },
    enabled: !!organization?.id
  });

  const { data: managerRatings, isLoading: isLoadingRatings } = useQuery({
    queryKey: ['manager-ratings', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('calls')
        .select(`
          manager_id,
          general_score,
          managers!inner(
            name
          )
        `)
        .eq('org_id', organization.id)
        .gte('date', sevenDaysAgo.toISOString())
        .not('general_score', 'is', null);

      if (error) throw error;

      // Группируем по менеджерам и считаем средний балл
      const ratingsByManager = data.reduce((acc: Record<string, any>, call) => {
        const managerId = call.manager_id;
        if (!managerId) return acc;

        if (!acc[managerId]) {
          acc[managerId] = {
            manager_id: managerId,
            manager_name: call.managers?.name || 'Неизвестный менеджер',
            scores: [],
            call_count: 0
          };
        }

        if (call.general_score) {
          acc[managerId].scores.push(call.general_score);
        }
        acc[managerId].call_count++;

        return acc;
      }, {});

      return Object.values(ratingsByManager).map((manager: any) => ({
        manager_id: manager.manager_id,
        manager_name: manager.manager_name,
        average_score: manager.scores.length > 0 
          ? manager.scores.reduce((sum: number, score: number) => sum + score, 0) / manager.scores.length 
          : 0,
        call_count: manager.call_count
      })) as ManagerRating[];
    },
    enabled: !!organization?.id
  });

  const { data: teamActivity, isLoading: isLoadingActivity } = useQuery({
    queryKey: ['team-activity', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return null;

      const today = new Date().toISOString().split('T')[0];

      const { data: todayCalls, error: callsError } = await supabase
        .from('calls')
        .select('manager_id')
        .eq('org_id', organization.id)
        .gte('date', today + 'T00:00:00')
        .lt('date', today + 'T23:59:59');

      if (callsError) throw callsError;

      const { data: managers, error: managersError } = await supabase
        .from('managers')
        .select('id')
        .eq('org_id', organization.id);

      if (managersError) throw managersError;

      const uniqueActiveManagers = new Set(
        todayCalls?.map(call => call.manager_id).filter(Boolean)
      ).size;

      return {
        active_managers: uniqueActiveManagers,
        average_duration: 2.3, // Mock data - в реальности нужно считать из длительности звонков
        total_calls_today: todayCalls?.length || 0
      } as TeamActivity;
    },
    enabled: !!organization?.id
  });

  return {
    callVolumeData,
    managerRatings,
    teamActivity,
    isLoading: isLoadingVolume || isLoadingRatings || isLoadingActivity
  };
};
