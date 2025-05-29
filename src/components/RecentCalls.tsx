
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RecentCallItem } from "./RecentCallItem";
import { normalizeProcessingStatus } from "@/utils/callUtils";

interface RecentCall {
  id: string;
  customer: {
    name: string;
    phone_number: string;
  };
  manager: {
    name: string;
  };
  date: string;
  summary: string;
  general_score: number;
  user_satisfaction_index: number;
  communication_skills: number;
  sales_technique: number;
  transcription_score: number;
  audio_file_url?: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
}

const RecentCalls = () => {
  const { data: recentCalls = [], isLoading } = useQuery({
    queryKey: ['recent-calls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calls')
        .select(`
          id,
          date,
          summary,
          general_score,
          user_satisfaction_index,
          communication_skills,
          sales_technique,
          transcription_score,
          audio_file_url,
          processing_status,
          customers:customer_id (
            name,
            phone_number
          ),
          managers:manager_id (
            name
          )
        `)
        .order('date', { ascending: false })
        .limit(5);
      
      if (error) throw error;

      return data?.map(call => ({
        id: call.id,
        customer: {
          name: call.customers?.name || 'Неизвестный клиент',
          phone_number: call.customers?.phone_number || ''
        },
        manager: {
          name: call.managers?.name || 'Неизвестный менеджер'
        },
        date: call.date,
        summary: call.summary || 'Краткое описание недоступно',
        general_score: call.general_score || 0,
        user_satisfaction_index: (call.user_satisfaction_index || 0) * 10,
        communication_skills: call.communication_skills || 0,
        sales_technique: call.sales_technique || 0,
        transcription_score: call.transcription_score || 0,
        audio_file_url: call.audio_file_url,
        processing_status: normalizeProcessingStatus(call.processing_status)
      })) as RecentCall[] || [];
    }
  });

  if (isLoading) {
    return (
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-600" />
              Последние звонки
            </CardTitle>
            <Button variant="outline" size="sm">
              Посмотреть все
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Загрузка звонков...</span>
        </CardContent>
      </Card>
    );
  }

  if (recentCalls.length === 0) {
    return (
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-600" />
              Последние звонки
            </CardTitle>
            <Button variant="outline" size="sm">
              Посмотреть все
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-center py-8 text-gray-500">
          Звонки не найдены
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-blue-600" />
            Последние звонки
          </CardTitle>
          <Button variant="outline" size="sm">
            Посмотреть все
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentCalls.map((call) => (
            <RecentCallItem key={call.id} call={call} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export { RecentCalls };
