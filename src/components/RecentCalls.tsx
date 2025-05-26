
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
  MessageSquare 
} from "lucide-react";

const RecentCalls = () => {
  const recentCalls = [
    {
      id: "CALL-001",
      customer: "Иван Иванов",
      phone: "+7 999 123-45-67",
      manager: "Петров П.",
      duration: "6:32",
      time: "2 часа назад",
      satisfaction: 92,
      transcription: 8.5,
      communication: 9.0,
      sales: 7.5,
      general: 8.3,
      status: "completed",
      summary: "Клиент интересовался бронированием бани на выходные..."
    },
    {
      id: "CALL-002", 
      customer: "Мария Петрова",
      phone: "+7 999 234-56-78",
      manager: "Иванов И.",
      duration: "4:18",
      time: "3 часа назад",
      satisfaction: 88,
      transcription: 7.8,
      communication: 8.5,
      sales: 8.0,
      general: 8.1,
      status: "completed",
      summary: "Звонок по поводу забытых вещей в раздевалке..."
    },
    {
      id: "CALL-003",
      customer: "Алексей Сидоров", 
      phone: "+7 999 345-67-89",
      manager: "Сидоров С.",
      duration: "8:45",
      time: "5 часов назад",
      satisfaction: 95,
      transcription: 9.2,
      communication: 9.5,
      sales: 8.8,
      general: 9.1,
      status: "completed",
      summary: "Консультация по услугам VIP-зоны и дополнительным опциям..."
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return 'text-green-600';
    if (score >= 7.0) return 'text-yellow-600';
    return 'text-red-600';
  };

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
                      <span className="font-medium text-gray-900">{call.customer}</span>
                    </div>
                    <Badge className={getStatusColor(call.status)}>
                      Завершен
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="block">Телефон:</span>
                      <span className="font-medium">{call.phone}</span>
                    </div>
                    <div>
                      <span className="block">Менеджер:</span>
                      <span className="font-medium">{call.manager}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{call.duration} • {call.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      <span className={`font-medium ${getScoreColor(call.general)}`}>
                        {call.general}/10
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {call.summary}
                  </p>

                  <div className="grid grid-cols-4 gap-3 text-xs">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-medium text-gray-900">{call.satisfaction}%</div>
                      <div className="text-gray-500">Удовлетворенность</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className={`font-medium ${getScoreColor(call.transcription)}`}>
                        {call.transcription}
                      </div>
                      <div className="text-gray-500">Транскрипция</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className={`font-medium ${getScoreColor(call.communication)}`}>
                        {call.communication}
                      </div>
                      <div className="text-gray-500">Коммуникация</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className={`font-medium ${getScoreColor(call.sales)}`}>
                        {call.sales}
                      </div>
                      <div className="text-gray-500">Продажи</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Button size="sm" variant="outline" className="gap-2">
                    <Play className="h-3 w-3" />
                    Аудио
                  </Button>
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
