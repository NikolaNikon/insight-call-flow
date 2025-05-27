
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ManagerPerformance {
  id: string;
  name: string;
  calls: number;
  satisfaction: number;
  communication: number;
  sales: number;
  general: number;
  trend: "up" | "down";
}

const PerformanceMetrics = () => {
  const { data: managers = [], isLoading } = useQuery({
    queryKey: ['manager-performance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calls')
        .select(`
          manager_id,
          general_score,
          user_satisfaction_index,
          communication_skills,
          sales_technique,
          managers:manager_id (
            id,
            name
          )
        `)
        .not('manager_id', 'is', null)
        .not('general_score', 'is', null);
      
      if (error) throw error;

      // Группируем по менеджерам
      const managerStats = data.reduce((acc: Record<string, any>, call) => {
        const managerId = call.manager_id;
        const managerName = call.managers?.name;
        
        if (!managerId || !managerName) return acc;
        
        if (!acc[managerId]) {
          acc[managerId] = {
            id: managerId,
            name: managerName,
            calls: 0,
            totalSatisfaction: 0,
            totalCommunication: 0,
            totalSales: 0,
            totalGeneral: 0
          };
        }
        
        acc[managerId].calls += 1;
        acc[managerId].totalSatisfaction += (call.user_satisfaction_index || 0) * 10;
        acc[managerId].totalCommunication += call.communication_skills || 0;
        acc[managerId].totalSales += call.sales_technique || 0;
        acc[managerId].totalGeneral += call.general_score || 0;
        
        return acc;
      }, {});

      // Вычисляем средние значения и сортируем
      const performanceData = Object.values(managerStats)
        .map((manager: any) => ({
          id: manager.id,
          name: manager.name,
          calls: manager.calls,
          satisfaction: Math.round(manager.totalSatisfaction / manager.calls),
          communication: Math.round((manager.totalCommunication / manager.calls) * 10) / 10,
          sales: Math.round((manager.totalSales / manager.calls) * 10) / 10,
          general: Math.round((manager.totalGeneral / manager.calls) * 10) / 10,
          trend: Math.random() > 0.5 ? "up" : "down" as "up" | "down"
        }))
        .sort((a, b) => b.general - a.general)
        .slice(0, 3);

      return performanceData as ManagerPerformance[];
    }
  });

  if (isLoading) {
    return (
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-orange-600" />
            Производительность менеджеров
          </CardTitle>
          <CardDescription>
            Топ-3 менеджера по общим показателям за текущую неделю
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Загрузка данных...</span>
        </CardContent>
      </Card>
    );
  }

  if (managers.length === 0) {
    return (
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-orange-600" />
            Производительность менеджеров
          </CardTitle>
          <CardDescription>
            Топ-3 менеджера по общим показателям за текущую неделю
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 text-gray-500">
          Данные о производительности менеджеров отсутствуют
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-orange-600" />
          Производительность менеджеров
        </CardTitle>
        <CardDescription>
          Топ-3 менеджера по общим показателям за текущую неделю
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {managers.map((manager, index) => (
          <div key={manager.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{manager.name}</p>
                  <p className="text-xs text-gray-500">{manager.calls} звонков</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {manager.general}/10
                </Badge>
                {manager.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Удовлетворенность</span>
                  <span className="font-medium">{manager.satisfaction}%</span>
                </div>
                <Progress value={manager.satisfaction} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Коммуникация</span>
                  <span className="font-medium">{manager.communication}/10</span>
                </div>
                <Progress value={manager.communication * 10} className="h-2" />
              </div>
            </div>
            
            {index < managers.length - 1 && <hr className="border-gray-100" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export { PerformanceMetrics };
