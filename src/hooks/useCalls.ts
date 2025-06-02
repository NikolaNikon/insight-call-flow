
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Call {
  id: string;
  date: string;
  transcription: string;
  summary: string;
  general_score: number;
  user_satisfaction_index: number;
  communication_skills: number;
  sales_technique: number;
  transcription_score: number;
  audio_file_url: string;
  processing_status: string;
  task_id?: string;
  customer: {
    id: string;
    name: string;
    phone_number: string;
  } | null;
  manager: {
    id: string;
    name: string;
    department: string;
  } | null;
}

export const useCalls = () => {
  return useQuery({
    queryKey: ['calls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calls')
        .select(`
          id,
          date,
          transcription,
          summary,
          general_score,
          user_satisfaction_index,
          communication_skills,
          sales_technique,
          transcription_score,
          audio_file_url,
          processing_status,
          task_id,
          customers:customer_id (
            id,
            name,
            phone_number
          ),
          managers:manager_id (
            id,
            name,
            department
          )
        `)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      // Преобразуем данные для соответствия интерфейсу Call
      const transformedData = data?.map(call => ({
        id: call.id,
        date: call.date,
        transcription: call.transcription || '',
        summary: call.summary || '',
        general_score: call.general_score || 0,
        user_satisfaction_index: call.user_satisfaction_index || 0,
        communication_skills: call.communication_skills || 0,
        sales_technique: call.sales_technique || 0,
        transcription_score: call.transcription_score || 0,
        audio_file_url: call.audio_file_url || '',
        processing_status: call.processing_status || 'pending',
        task_id: call.task_id,
        customer: call.customers ? {
          id: call.customers.id,
          name: call.customers.name,
          phone_number: call.customers.phone_number
        } : null,
        manager: call.managers ? {
          id: call.managers.id,
          name: call.managers.name,
          department: call.managers.department || ''
        } : null
      })) || [];

      return transformedData;
    }
  });
};

export const useCallStats = () => {
  return useQuery({
    queryKey: ['call-stats'],
    queryFn: async () => {
      const { data: calls, error } = await supabase
        .from('calls')
        .select('general_score, user_satisfaction_index, date, processing_status')
        .not('general_score', 'is', null);
      
      if (error) throw error;

      const totalCalls = calls.length;
      const completedCalls = calls.filter(call => call.processing_status === 'completed');
      const avgScore = completedCalls.length > 0 
        ? completedCalls.reduce((sum, call) => sum + (call.general_score || 0), 0) / completedCalls.length
        : 0;
      const avgSatisfaction = completedCalls.length > 0
        ? completedCalls.reduce((sum, call) => sum + (call.user_satisfaction_index || 0), 0) / completedCalls.length
        : 0;
      
      // Группировка по дням для графика
      const dailyStats = completedCalls.reduce((acc: Record<string, { calls: number; satisfaction: number }>, call) => {
        const date = new Date(call.date).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { calls: 0, satisfaction: 0 };
        }
        acc[date].calls += 1;
        acc[date].satisfaction += call.user_satisfaction_index || 0;
        return acc;
      }, {});

      const chartData = Object.entries(dailyStats).map(([date, stats]) => ({
        date,
        calls: stats.calls,
        satisfaction: Math.round((stats.satisfaction / stats.calls) * 10)
      }));

      return {
        totalCalls,
        avgScore: Math.round(avgScore * 10) / 10,
        avgSatisfaction: Math.round(avgSatisfaction * 100),
        chartData
      };
    }
  });
};
