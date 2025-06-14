
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

export const IssuesAnalysis = () => {
  const topIssues = [
    { issue: 'Долгое время ожидания', count: 23, trend: 'up' },
    { issue: 'Некорректная информация о бронировании', count: 18, trend: 'down' },
    { issue: 'Плохое качество услуг', count: 15, trend: 'up' },
    { issue: 'Проблемы с оплатой', count: 12, trend: 'down' },
    { issue: 'Забытые вещи', count: 9, trend: 'stable' }
  ];

  return (
    <Card className="bg-card border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-5 w-5 text-theme-orange-text" />
          <h3 className="text-lg font-semibold text-foreground">Популярные проблемы клиентов</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Наиболее часто встречающиеся проблемы и жалобы
        </p>
        
        <div className="space-y-4">
          {topIssues.map((issue, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-theme-orange-bg rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-theme-orange-text">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{issue.issue}</h4>
                  <p className="text-sm text-muted-foreground">Упоминаний: {issue.count}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {issue.trend === 'up' && (
                  <Badge variant="destructive" className="text-xs bg-theme-red-bg text-theme-red-text border-theme-red-text/50">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Растет
                  </Badge>
                )}
                {issue.trend === 'down' && (
                  <Badge variant="default" className="text-xs bg-theme-green-bg text-theme-green-text border-theme-green-text/50">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    Снижается
                  </Badge>
                )}
                {issue.trend === 'stable' && (
                  <Badge variant="outline" className="text-xs">
                    Стабильно
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
