
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus } from 'lucide-react';
import { useKeywordTrackersApi } from '@/hooks/useKeywordTrackersApi';
import { KeywordTrackerModal } from '@/components/keyword-trackers/KeywordTrackerModal';

export const KeywordTrackerCard = () => {
  const { trackers, isLoading } = useKeywordTrackersApi({ include_stats: true });
  const [showModal, setShowModal] = useState(false);

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
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="h-6 bg-muted rounded w-12"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!trackers || trackers.length === 0) {
    return (
      <>
        <Card className="col-span-1 border-dashed border-2 border-theme-yellow-text bg-theme-yellow-bg">
          <CardHeader>
            <CardTitle className="text-theme-yellow-text">🧠 Ключевые слова в разговорах</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="text-theme-yellow-text/70 mb-4">Трекеры не настроены</p>
            <Button 
              onClick={() => setShowModal(true)} 
              className="bg-theme-orange-text hover:bg-theme-orange-text/90 text-theme-orange-bg"
            >
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
              className="hover:bg-theme-gray-bg"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Трекеры настроены ({trackers.length}), но пока нет данных о совпадениях.
              </p>
              
              <div className="text-center py-4">
                <p className="text-muted-foreground text-sm mb-3">
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
            className="hover:bg-theme-gray-bg"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Наиболее частые ключевые слова за последние 7 дней:
            </p>
            
            <div className="space-y-3">
              {topTrackers.map((tracker, index) => (
                <div key={tracker.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {index + 1}. {tracker.name}
                    </span>
                    <Badge 
                      variant="outline" 
                      className="text-xs bg-theme-gray-bg text-theme-gray-text border-theme-gray-text"
                    >
                      {tracker.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className="flex items-center gap-1 bg-theme-blue-bg text-theme-blue-text"
                    >
                      {tracker.mentions_count || 0}
                      <Minus className="h-3 w-3" />
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
