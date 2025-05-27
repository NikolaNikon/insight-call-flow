
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Phone, 
  Clock, 
  User, 
  Star,
  Play,
  FileText,
  MessageSquare,
  Loader2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

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
        audio_file_url: call.audio_file_url
      })) as RecentCall[] || [];
    }
  });

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return 'text-green-600';
    if (score >= 7.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Меньше часа назад';
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'час' : diffHours < 5 ? 'часа' : 'часов'} назад`;
    
    return format(date, "dd.MM.yyyy HH:mm", { locale: ru });
  };

  const calculateDuration = (date: string) => {
    // Заглушка для длительности звонка (в реальном проекте это должно быть в БД)
    return `${Math.floor(Math.random() * 10) + 3}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
  };

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
            <div key={call.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{call.customer.name}</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Завершен
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="block">Телефон:</span>
                      <span className="font-medium">{call.customer.phone_number}</span>
                    </div>
                    <div>
                      <span className="block">Менеджер:</span>
                      <span className="font-medium">{call.manager.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{calculateDuration(call.date)} • {formatDate(call.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      <span className={`font-medium ${getScoreColor(call.general_score)}`}>
                        {call.general_score}/10
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {call.summary}
                  </p>

                  <div className="grid grid-cols-4 gap-3 text-xs">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-medium text-gray-900">{call.user_satisfaction_index}%</div>
                      <div className="text-gray-500">Удовлетворенность</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className={`font-medium ${getScoreColor(call.transcription_score)}`}>
                        {call.transcription_score}
                      </div>
                      <div className="text-gray-500">Транскрипция</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className={`font-medium ${getScoreColor(call.communication_skills)}`}>
                        {call.communication_skills}
                      </div>
                      <div className="text-gray-500">Коммуникация</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className={`font-medium ${getScoreColor(call.sales_technique)}`}>
                        {call.sales_technique}
                      </div>
                      <div className="text-gray-500">Продажи</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {call.audio_file_url && (
                    <Button size="sm" variant="outline" className="gap-2">
                      <Play className="h-3 w-3" />
                      Аудио
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="gap-2">
                    <FileText className="h-3 w-3" />
                    Отчет
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2">
                    <MessageSquare className="h-3 w-3" />
                    Детали
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export { RecentCalls };
