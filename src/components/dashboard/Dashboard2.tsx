
import React from 'react';
import { NsmSummaryCard } from './NsmSummaryCard';
import { KeywordTrackerCard } from './KeywordTrackerCard';
import { MiniCallsChart } from './MiniCallsChart';
import { ManagerScoreCard } from './ManagerScoreCard';
import { TeamActivityBlock } from './TeamActivityBlock';

export const Dashboard2 = () => {
  console.log('Dashboard2 component rendering...');
  
  return (
    <div className="space-y-6">
      {/* Отладочная информация для Dashboard2 */}
      <div className="p-4 bg-green-50 border border-green-200 rounded">
        <div className="text-sm text-green-800">
          Dashboard2 loaded successfully
        </div>
      </div>

      {/* Основная сетка дашборда */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* NSM метрика - занимает 2 колонки */}
        <NsmSummaryCard />
        
        {/* Keyword Trackers - 1 колонка */}
        <KeywordTrackerCard />
      </div>

      {/* Вторая строка */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* График звонков */}
        <MiniCallsChart />
        
        {/* Активность команды */}
        <TeamActivityBlock />
      </div>

      {/* Рейтинги менеджеров */}
      <div className="grid grid-cols-1">
        <ManagerScoreCard />
      </div>
    </div>
  );
};
