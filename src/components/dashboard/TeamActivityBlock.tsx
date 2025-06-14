
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardData } from '@/hooks/useDashboardData';

export const TeamActivityBlock = () => {
  const { teamActivity, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🧑‍💼 Активность команды</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-2/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!teamActivity) {
    return (
      <Card className="border-dashed border-2">
        <CardHeader>
          <CardTitle>🧑‍💼 Активность команды</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Данные пока не собраны</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🧑‍💼 Активность команды</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-theme-blue-text">
                {teamActivity.active_managers}
              </div>
              <div className="text-sm text-muted-foreground">
                активных менеджеров
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-theme-green-text">
                {teamActivity.average_duration}
              </div>
              <div className="text-sm text-muted-foreground">
                мин. средний звонок
              </div>
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground text-center">
              Сегодня обработано <strong>{teamActivity.total_calls_today}</strong> звонков
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
