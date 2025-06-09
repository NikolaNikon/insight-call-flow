
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOrgMetrics, OrgMetric } from '@/hooks/useOrgMetrics';

interface NsmSelectorModalProps {
  open: boolean;
  onClose: () => void;
  currentMetric?: OrgMetric | null;
}

export const NsmSelectorModal: React.FC<NsmSelectorModalProps> = ({
  open,
  onClose,
  currentMetric
}) => {
  const { updateMetric, isUpdating } = useOrgMetrics();
  const [targetValue, setTargetValue] = React.useState(
    currentMetric?.target_value?.toString() || '5'
  );

  const handleSave = async () => {
    if (!currentMetric) return;

    await updateMetric({
      id: currentMetric.id,
      target_value: parseFloat(targetValue)
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Настройка главной метрики NSM</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Текущая метрика</Label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">Средняя оценка звонков</p>
              <p className="text-sm text-gray-600">
                Показывает качество работы команды на основе оценок звонков
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target">Целевое значение</Label>
            <Input
              id="target"
              type="number"
              step="0.1"
              min="1"
              max="10"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder="5.0"
            />
            <p className="text-xs text-gray-500">
              Укажите целевое значение от 1 до 10
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={isUpdating}>
              {isUpdating ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
