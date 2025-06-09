
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Settings } from 'lucide-react';
import { useOrgMetrics } from '@/hooks/useOrgMetrics';
import { NsmSelectorModal } from './NsmSelectorModal';

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
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!nsmMetric) {
    return (
      <Card className="col-span-2 border-dashed border-2 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔷 Главная метрика команды
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-gray-600 mb-4">Метрика не выбрана</p>
          <Button onClick={handleSetupNSM} className="bg-amber-600 hover:bg-amber-700">
            Выбрать NSM
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentValue = nsmMetric.current_value || 0;
  const targetValue = nsmMetric.target_value || 5;
  const percentage = Math.round((currentValue / targetValue) * 100);
  
  // Mock trend data - в реальности нужно получать из metric_history
  const trend = 5; // +5%
  const isPositiveTrend = trend > 0;

  return (
    <>
      <Card className="col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            🔷 Главная метрика команды
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowModal(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-blue-900">
                {currentValue.toFixed(1)} ★
              </div>
              <Badge
                variant={isPositiveTrend ? "default" : "destructive"}
                className="flex items-center gap-1"
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
              <div className="flex justify-between text-sm text-gray-600">
                <span>Средняя оценка звонков</span>
                <span>{percentage}% от цели</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>
            </div>

            <p className="text-sm text-gray-600">
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
