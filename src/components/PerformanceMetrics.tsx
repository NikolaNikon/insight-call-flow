
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, TrendingDown } from "lucide-react";

const PerformanceMetrics = () => {
  const managers = [
    {
      name: "Иванов И.",
      calls: 45,
      satisfaction: 92,
      transcription: 8.5,
      communication: 9.0,
      sales: 7.5,
      general: 8.3,
      trend: "up"
    },
    {
      name: "Петров П.",
      calls: 38,
      satisfaction: 87,
      transcription: 7.8,
      communication: 8.2,
      sales: 6.8,
      general: 7.6,
      trend: "up"
    },
    {
      name: "Сидоров С.",
      calls: 52,
      satisfaction: 84,
      transcription: 8.9,
      communication: 7.8,
      sales: 7.2,
      general: 7.9,
      trend: "down"
    }
  ];

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
          <div key={index} className="space-y-3">
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
