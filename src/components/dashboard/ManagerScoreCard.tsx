
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useDashboardData } from '@/hooks/useDashboardData';

export const ManagerScoreCard = () => {
  const { managerRatings, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🎯 Оценки менеджеров</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-2 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!managerRatings || managerRatings.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardHeader>
          <CardTitle>🎯 Оценки менеджеров</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Пока нет оценок по звонкам</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🎯 Оценки менеджеров за последние 7 дней</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {managerRatings.slice(0, 5).map((manager) => {
            const percentage = (manager.average_score / 10) * 100;
            
            return (
              <div key={manager.manager_id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">
                    {manager.manager_name}
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-bold">
                      {manager.average_score.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({manager.call_count} звонков)
                    </span>
                  </div>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-2"
                />
              </div>
            );
          })}
          
          {managerRatings.length > 5 && (
            <p className="text-xs text-muted-foreground text-center">
              и еще {managerRatings.length - 5} менеджеров...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
