
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useKeywordTrackers } from '@/hooks/useKeywordTrackers';
import { KeywordEditorModal } from './KeywordEditorModal';

export const KeywordTrackerCard = () => {
  const { topTrackers, hasTrackers, isLoading } = useKeywordTrackers();
  const [showModal, setShowModal] = useState(false);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>🧠 Ключевые слова в разговорах</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-6 bg-gray-200 rounded w-12"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Показываем empty state только если нет ни одного трекера
  if (!hasTrackers) {
    return (
      <Card className="col-span-1 border-dashed border-2 border-amber-200">
        <CardHeader>
          <CardTitle>🧠 Ключевые слова в разговорах</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-gray-600 mb-4">Трекеры не настроены</p>
          <Button onClick={() => setShowModal(true)} className="bg-amber-600 hover:bg-amber-700">
            <Plus className="mr-2 h-4 w-4" />
            Создать трекер
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Если трекеры есть, но нет статистики
  if (!topTrackers || topTrackers.length === 0) {
    return (
      <>
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>🧠 Ключевые слова в разговорах</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowModal(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Трекеры настроены, но пока нет данных о совпадениях.
              </p>
              
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm mb-3">
                  Совпадения появятся после обработки новых звонков
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(true)}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить трекер
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <KeywordEditorModal
          open={showModal}
          onClose={() => setShowModal(false)}
        />
      </>
    );
  }

  // Если есть и трекеры, и статистика
  return (
    <>
      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>🧠 Ключевые слова в разговорах</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowModal(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Наиболее частые ключевые слова за последние 7 дней:
            </p>
            
            <div className="space-y-3">
              {topTrackers.slice(0, 3).map((tracker, index) => (
                <div key={tracker.tracker_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {index + 1}. {tracker.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {tracker.total_matches}
                      {getTrendIcon(tracker.trend)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowModal(true)}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Добавить трекер
            </Button>
          </div>
        </CardContent>
      </Card>

      <KeywordEditorModal
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};
