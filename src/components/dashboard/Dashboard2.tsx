
import React from 'react';
import { NsmSummaryCard } from './NsmSummaryCard';
import { KeywordTrackerCard } from './KeywordTrackerCard';
import { MiniCallsChart } from './MiniCallsChart';
import { ManagerScoreCard } from './ManagerScoreCard';
import { TeamActivityBlock } from './TeamActivityBlock';

export const Dashboard2 = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Dashboard 2.0
        </h2>
        <p className="text-gray-600">
          Быстрый обзор ключевых метрик и активности команды
        </p>
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
