
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  BarChart3, 
  Phone, 
  FileText, 
  Users, 
  Shield,
  Zap,
  HelpCircle
} from 'lucide-react';

interface ArticleCategoriesProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

const categories = [
  { id: 'all', name: 'Все статьи', icon: HelpCircle, count: 24 },
  { id: 'getting-started', name: 'Начало работы', icon: Zap, count: 5 },
  { id: 'calls', name: 'Звонки', icon: Phone, count: 8 },
  { id: 'analytics', name: 'Аналитика', icon: BarChart3, count: 6 },
  { id: 'reports', name: 'Отчеты', icon: FileText, count: 4 },
  { id: 'users', name: 'Пользователи', icon: Users, count: 3 },
  { id: 'settings', name: 'Настройки', icon: Settings, count: 7 },
  { id: 'security', name: 'Безопасность', icon: Shield, count: 2 },
];

export const ArticleCategories = ({ selectedCategory, onCategorySelect }: ArticleCategoriesProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <h3 className="font-semibold text-graphite mb-4">Категории</h3>
      <div className="space-y-1">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;
          
          return (
            <Button
              key={category.id}
              variant={isSelected ? 'default' : 'ghost'}
              className={`w-full justify-between text-left h-auto p-3 ${
                isSelected ? 'bg-primary text-white' : 'hover:bg-gray-50'
              }`}
              onClick={() => onCategorySelect(category.id)}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="text-sm">{category.name}</span>
              </div>
              <Badge 
                variant={isSelected ? 'secondary' : 'outline'} 
                className={`text-xs ${isSelected ? 'bg-white/20 text-white' : ''}`}
              >
                {category.count}
              </Badge>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
