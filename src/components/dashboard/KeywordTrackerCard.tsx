
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useKeywordTrackersApi } from '@/hooks/useKeywordTrackersApi';
import { KeywordTrackerModal } from '@/components/keyword-trackers/KeywordTrackerModal';

export const KeywordTrackerCard = () => {
  const { trackers, isLoading } = useKeywordTrackersApi({ include_stats: true });
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
  if (!trackers || trackers.length === 0) {
    return (
      <>
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

        <KeywordTrackerModal
          open={showModal}
          onClose={() => setShowModal(false)}
        />
      </>
    );
  }

  // Если трекеры есть, но нет статистики
  const trackersWithMentions = trackers.filter(t => (t.mentions_count || 0) > 0);
  
  if (trackersWithMentions.length === 0) {
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
                Трекеры настроены ({trackers.length}), но пока нет данных о совпадениях.
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

        <KeywordTrackerModal
          open={showModal}
          onClose={() => setShowModal(false)}
        />
      </>
    );
  }

  // Если есть и трекеры, и статистика - сортируем по количеству упоминаний
  const topTrackers = trackersWithMentions
    .sort((a, b) => (b.mentions_count || 0) - (a.mentions_count || 0))
    .slice(0, 3);

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
              {topTrackers.map((tracker, index) => (
                <div key={tracker.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {index + 1}. {tracker.name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {tracker.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {tracker.mentions_count || 0}
                      <Minus className="h-3 w-3 text-gray-500" />
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

      <KeywordTrackerModal
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};
