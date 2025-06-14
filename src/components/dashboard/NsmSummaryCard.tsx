
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Settings } from 'lucide-react';
import { useOrgMetrics } from '@/hooks/useOrgMetrics';
import { NsmSelectorModal } from './NsmSelectorModal';
import { cn } from '@/lib/utils';

export const NsmSummaryCard = () => {
  const { nsmMetric, initializeNSM, isLoading } = useOrgMetrics();
  const [showModal, setShowModal] = useState(false);

  const handleSetupNSM = async () => {
    if (!nsmMetric) {
      await initializeNSM();
    }
    setShowModal(true);
  };

  if (isLoading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔷 Главная метрика команды
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!nsmMetric) {
    return (
      <Card className="col-span-2 border-dashed border-2 border-theme-yellow-text/50 bg-theme-yellow-bg text-theme-yellow-text">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔷 Главная метрика команды
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground mb-4">Метрика не выбрана</p>
          <Button onClick={handleSetupNSM} className="bg-theme-orange-text text-theme-orange-bg hover:bg-theme-orange-text/90">
            Выбрать NSM
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentValue = nsmMetric.current_value || 0;
  const targetValue = nsmMetric.target_value || 5;
  const percentage = Math.round((currentValue / targetValue) * 100);
  
  const trend = 5;
  const isPositiveTrend = trend > 0;

  return (
    <>
      <Card className="col-span-2 bg-theme-blue-bg border-theme-blue-text/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-theme-blue-text">
            🔷 Главная метрика команды
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowModal(true)}
            className="text-theme-blue-text hover:bg-theme-blue-text/10"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-theme-blue-text">
                {currentValue.toFixed(1)} ★
              </div>
              <Badge
                className={cn(
                  'flex items-center gap-1 border-transparent',
                  isPositiveTrend 
                    ? 'bg-theme-green-bg text-theme-green-text' 
                    : 'bg-theme-red-bg text-theme-red-text'
                )}
              >
                {isPositiveTrend ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(trend)}% за 7 дней
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-theme-blue-text/70">
                <span>Средняя оценка звонков</span>
                <span>{percentage}% от цели</span>
              </div>
              <div className="w-full bg-theme-blue-text/20 rounded-full h-2">
                <div
                  className="bg-theme-blue-text h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>
            </div>

            <p className="text-sm text-theme-blue-text/70">
              Цель: {targetValue} ★ | Текущий результат: {currentValue.toFixed(1)} ★
            </p>
          </div>
        </CardContent>
      </Card>

      <NsmSelectorModal
        open={showModal}
        onClose={() => setShowModal(false)}
        currentMetric={nsmMetric}
      />
    </>
  );
};
