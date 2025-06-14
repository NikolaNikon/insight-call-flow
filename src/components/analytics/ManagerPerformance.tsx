
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
    <Card className="bg-card border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-foreground">Производительность менеджеров</h3>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Анализ основан на количестве звонков, удовлетворенности клиентов и общей оценке качества</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <p className="text-sm text-muted-foreground mb-6">Детальная статистика по каждому менеджеру</p>
        
        <div className="space-y-6">
          {managerPerformance.map((manager, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <span className="font-medium text-muted-foreground">
                      {manager.name.split(' ')[0][0]}{manager.name.split(' ')[1][0]}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{manager.name}</h4>
                    <p className="text-sm text-muted-foreground">{manager.calls} звонков за неделю</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {manager.general}/10
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Удовлетворенность клиентов</span>
                    <span className="font-medium">{manager.satisfaction}%</span>
                  </div>
                  <Progress value={manager.satisfaction} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Общая оценка</span>
                    <span className="font-medium">{manager.general}/10</span>
                  </div>
                  <Progress value={manager.general * 10} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Количество звонков</span>
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
