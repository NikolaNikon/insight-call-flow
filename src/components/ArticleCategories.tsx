
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useKnowledgeCategories } from '@/hooks/useKnowledgeBase';

interface ArticleCategoriesProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

const iconMap: Record<string, any> = {
  'getting-started': Zap,
  'calls': Phone,
  'analytics': BarChart3,
  'integrations': Settings,
  'settings': Settings,
  'users': Users,
  'security': Shield,
};

export const ArticleCategories = ({ selectedCategory, onCategorySelect }: ArticleCategoriesProps) => {
  const { data: categories = [], isLoading } = useKnowledgeCategories();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="font-semibold text-graphite mb-4">Категории</h3>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Добавляем "Все статьи" в начало списка
  const allCategories = [
    { id: 'all', name: 'Все статьи', slug: 'all' },
    ...categories
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <h3 className="font-semibold text-graphite mb-4">Категории</h3>
      <div className="space-y-1">
        {allCategories.map((category) => {
          const Icon = category.slug === 'all' ? HelpCircle : iconMap[category.slug] || FileText;
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
              {/* TODO: Добавить подсчет статей по категориям */}
              <Badge 
                variant={isSelected ? 'secondary' : 'outline'} 
                className={`text-xs ${isSelected ? 'bg-white/20 text-white' : ''}`}
              >
                {category.slug === 'all' ? '24' : '0'}
              </Badge>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
