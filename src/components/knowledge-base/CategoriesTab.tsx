
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const CategoriesTab = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <h3 className="text-lg font-semibold text-graphite mb-4">Управление категориями</h3>
      <p className="text-gray-600">
        Здесь вы сможете создавать, редактировать и удалять категории для организации статей.
      </p>
      <Button className="mt-4" variant="outline">
        <Plus className="h-4 w-4 mr-2" />
        Добавить категорию
      </Button>
    </div>
  );
};
