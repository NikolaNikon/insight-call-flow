
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { X } from 'lucide-react';
import { KeywordTrackerExtended, useKeywordTrackersApi } from '@/hooks/useKeywordTrackersApi';

interface KeywordTrackerModalProps {
  open: boolean;
  onClose: () => void;
  tracker?: KeywordTrackerExtended | null;
}

export const KeywordTrackerModal: React.FC<KeywordTrackerModalProps> = ({
  open,
  onClose,
  tracker
}) => {
  const { createTracker, updateTracker, isCreating, isUpdating } = useKeywordTrackersApi();
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [isActive, setIsActive] = useState(true);

  const isEditing = !!tracker;
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (tracker) {
      setName(tracker.name);
      setCategory(tracker.category);
      setKeywords(tracker.keywords);
      setIsActive(tracker.is_active);
    } else {
      setName('');
      setCategory('Общие');
      setKeywords([]);
      setIsActive(true);
    }
  }, [tracker]);

  const handleAddKeyword = () => {
    const trimmed = currentKeyword.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setCurrentKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleSave = async () => {
    if (!name.trim() || keywords.length === 0) {
      return;
    }

    try {
      const trackerData = {
        name: name.trim(),
        category: category.trim() || 'Общие',
        keywords,
        is_active: isActive
      };

      if (isEditing && tracker) {
        await updateTracker({
          id: tracker.id,
          ...trackerData
        });
      } else {
        await createTracker(trackerData);
      }

      handleClose();
    } catch (error) {
      console.error('Failed to save tracker:', error);
    }
  };

  const handleClose = () => {
    setName('');
    setCategory('');
    setKeywords([]);
    setCurrentKeyword('');
    setIsActive(true);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Редактировать трекер' : 'Создать трекер ключевых слов'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название трекера</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Жалобы на доставку"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Категория</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Например: Жалобы"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keyword">Ключевые слова</Label>
            <div className="flex gap-2">
              <Input
                id="keyword"
                value={currentKeyword}
                onChange={(e) => setCurrentKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Введите ключевое слово"
              />
              <Button
                type="button"
                onClick={handleAddKeyword}
                disabled={!currentKeyword.trim()}
              >
                Добавить
              </Button>
            </div>
          </div>

          {keywords.length > 0 && (
            <div className="space-y-2">
              <Label>Добавленные слова:</Label>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                    {keyword}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveKeyword(keyword)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="is-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="is-active">Активен</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading || !name.trim() || keywords.length === 0}
            >
              {isLoading ? 'Сохранение...' : (isEditing ? 'Обновить' : 'Создать')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
