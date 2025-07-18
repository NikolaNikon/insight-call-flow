
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const SentimentAnalysis = () => {
  const sentimentData = [
    { name: 'Позитивные', value: 65, color: 'hsl(var(--text-color-green))' },
    { name: 'Нейтральные', value: 25, color: 'hsl(var(--text-color-yellow))' },
    { name: 'Негативные', value: 10, color: 'hsl(var(--text-color-red))' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-card border-0 shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Анализ настроений</h3>
          <p className="text-sm text-muted-foreground mb-4">Распределение настроений клиентов в звонках</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            {sentimentData.map((item, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
                <p className="text-xs text-muted-foreground">{item.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-0 shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Ключевые слова</h3>
          <p className="text-sm text-muted-foreground mb-4">Наиболее часто упоминаемые слова и фразы</p>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-theme-green-text mb-2 flex items-center gap-2">
                <ThumbsUp className="h-4 w-4" />
                Позитивные
              </h4>
              <div className="flex flex-wrap gap-2">
                {['отлично', 'спасибо', 'хороший сервис', 'довольны', 'рекомендую'].map((word, index) => (
                  <Badge key={index} variant="outline" className="text-theme-green-text border-theme-green-text/30 bg-theme-green-bg/50">
                    {word}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-theme-red-text mb-2 flex items-center gap-2">
                <ThumbsDown className="h-4 w-4" />
                Негативные
              </h4>
              <div className="flex flex-wrap gap-2">
                {['долго ждать', 'плохо', 'не доволен', 'проблема', 'жалоба'].map((word, index) => (
                  <Badge key={index} variant="outline" className="text-theme-red-text border-theme-red-text/30 bg-theme-red-bg/50">
                    {word}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
