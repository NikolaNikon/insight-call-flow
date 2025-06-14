import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Edit, Power, Trash2, MoreHorizontal, RotateCcw } from 'lucide-react';
import { KeywordTrackerExtended, useKeywordTrackersApi } from '@/hooks/useKeywordTrackersApi';

interface KeywordTrackerListProps {
  groupedTrackers: Record<string, KeywordTrackerExtended[]>;
  onEdit: (tracker: KeywordTrackerExtended) => void;
  onRefresh: () => void;
}

export const KeywordTrackerList: React.FC<KeywordTrackerListProps> = ({
  groupedTrackers,
  onEdit,
  onRefresh
}) => {
  const { updateTracker, deleteTracker, recalculateMentions } = useKeywordTrackersApi();

  const handleToggleActive = async (tracker: KeywordTrackerExtended) => {
    try {
      await updateTracker({
        id: tracker.id,
        is_active: !tracker.is_active
      });
      onRefresh();
    } catch (error) {
      console.error('Failed to toggle tracker:', error);
    }
  };

  const handleDelete = async (tracker: KeywordTrackerExtended) => {
    if (window.confirm(`Удалить трекер "${tracker.name}"?`)) {
      try {
        await deleteTracker(tracker.id);
        onRefresh();
      } catch (error) {
        console.error('Failed to delete tracker:', error);
      }
    }
  };

  const handleRecalculate = async (tracker: KeywordTrackerExtended) => {
    try {
      await recalculateMentions(tracker.id);
      onRefresh();
    } catch (error) {
      console.error('Failed to recalculate mentions:', error);
    }
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedTrackers).map(([category, trackers]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Категория: {category}</span>
              <Badge variant="secondary">{trackers.length} трекеров</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {trackers.map((tracker) => (
              <div 
                key={tracker.id}
                className={`border rounded-lg p-4 transition-opacity ${
                  !tracker.is_active ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{tracker.name}</h3>
                      {!tracker.is_active && (
                        <Badge variant="secondary">Неактивен</Badge>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <span className="text-sm text-muted-foreground">Ключевые слова: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tracker.keywords.slice(0, 3).map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                        {tracker.keywords.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{tracker.keywords.length - 3} еще
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        Упоминаний: <strong>{tracker.mentions_count || 0}</strong>
                      </span>
                      <span>
                        Создан: {new Date(tracker.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(tracker)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Редактировать
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleActive(tracker)}>
                        <Power className="h-4 w-4 mr-2" />
                        {tracker.is_active ? 'Отключить' : 'Включить'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRecalculate(tracker)}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Пересчитать статистику
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(tracker)}
                        className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
