
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

export const ManagerPerformance = () => {
  const managerPerformance = [
    { name: 'Иванов И.', calls: 45, satisfaction: 92, general: 8.3 },
    { name: 'Петров П.', calls: 38, satisfaction: 87, general: 7.6 },
    { name: 'Сидоров С.', calls: 52, satisfaction: 84, general: 7.9 },
    { name: 'Козлов К.', calls: 41, satisfaction: 90, general: 8.1 },
    { name: 'Васильев В.', calls: 35, satisfaction: 86, general: 7.8 }
  ];

  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Производительность менеджеров</h3>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-4 w-4 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Анализ основан на количестве звонков, удовлетворенности клиентов и общей оценке качества</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <p className="text-sm text-gray-600 mb-6">Детальная статистика по каждому менеджеру</p>
        
        <div className="space-y-6">
          {managerPerformance.map((manager, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="font-medium text-gray-700">
                      {manager.name.split(' ')[0][0]}{manager.name.split(' ')[1][0]}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{manager.name}</h4>
                    <p className="text-sm text-gray-500">{manager.calls} звонков за неделю</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {manager.general}/10
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Удовлетворенность клиентов</span>
                    <span className="font-medium">{manager.satisfaction}%</span>
                  </div>
                  <Progress value={manager.satisfaction} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Общая оценка</span>
                    <span className="font-medium">{manager.general}/10</span>
                  </div>
                  <Progress value={manager.general * 10} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Количество звонков</span>
                    <span className="font-medium">{manager.calls}</span>
                  </div>
                  <Progress value={(manager.calls / 60) * 100} className="h-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
