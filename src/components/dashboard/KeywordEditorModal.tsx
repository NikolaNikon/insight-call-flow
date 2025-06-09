
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useKeywordTrackers } from '@/hooks/useKeywordTrackers';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';

interface KeywordEditorModalProps {
  open: boolean;
  onClose: () => void;
}

export const KeywordEditorModal: React.FC<KeywordEditorModalProps> = ({
  open,
  onClose
}) => {
  const { organization } = useOrganization();
  const { createTracker, isCreating } = useKeywordTrackers();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState('');

  const handleAddKeyword = () => {
    if (currentKeyword.trim() && !keywords.includes(currentKeyword.trim())) {
      setKeywords([...keywords, currentKeyword.trim()]);
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
    if (!organization?.id || !name.trim() || keywords.length === 0) {
      toast({
        title: "Ошибка",
        description: "Заполните название и добавьте хотя бы одно ключевое слово",
        variant: "destructive"
      });
      return;
    }

    try {
      await createTracker({
        org_id: organization.id,
        name: name.trim(),
        keywords,
        is_active: true
      });

      toast({
        title: "Успешно",
        description: "Трекер ключевых слов создан"
      });

      // Сброс формы
      setName('');
      setKeywords([]);
      setCurrentKeyword('');
      onClose();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать трекер",
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    setName('');
    setKeywords([]);
    setCurrentKeyword('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Создать трекер ключевых слов</DialogTitle>
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

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={isCreating}>
              {isCreating ? 'Создание...' : 'Создать'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
