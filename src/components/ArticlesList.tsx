
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Clock, 
  User, 
  Eye,
  Edit,
  Calendar
} from 'lucide-react';

interface ArticlesListProps {
  searchQuery: string;
  selectedCategory: string;
}

// Моковые данные статей
const mockArticles = [
  {
    id: 1,
    title: 'Начало работы с CallControl',
    description: 'Пошаговое руководство для новых пользователей системы',
    category: 'getting-started',
    categoryName: 'Начало работы',
    author: 'Администратор',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    views: 156,
    readTime: '5 мин'
  },
  {
    id: 2,
    title: 'Как загружать и анализировать звонки',
    description: 'Подробная инструкция по загрузке аудиофайлов и получению аналитики',
    category: 'calls',
    categoryName: 'Звонки',
    author: 'Менеджер системы',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18',
    views: 89,
    readTime: '8 мин'
  },
  {
    id: 3,
    title: 'Настройка интеграции с Telegram',
    description: 'Подключение Telegram бота для получения уведомлений',
    category: 'settings',
    categoryName: 'Настройки',
    author: 'Разработчик',
    createdAt: '2024-01-08',
    updatedAt: '2024-01-16',
    views: 67,
    readTime: '6 мин'
  },
  {
    id: 4,
    title: 'Создание и экспорт отчетов',
    description: 'Как создавать различные типы отчетов и экспортировать их',
    category: 'reports',
    categoryName: 'Отчеты',
    author: 'Аналитик',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-14',
    views: 123,
    readTime: '10 мин'
  },
  {
    id: 5,
    title: 'Понимание аналитических метрик',
    description: 'Объяснение всех метрик и показателей в системе аналитики',
    category: 'analytics',
    categoryName: 'Аналитика',
    author: 'Аналитик',
    createdAt: '2024-01-03',
    updatedAt: '2024-01-12',
    views: 98,
    readTime: '12 мин'
  },
  {
    id: 6,
    title: 'Управление пользователями и ролями',
    description: 'Как добавлять пользователей и назначать им роли',
    category: 'users',
    categoryName: 'Пользователи',
    author: 'Администратор',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-10',
    views: 45,
    readTime: '7 мин'
  }
];

export const ArticlesList = ({ searchQuery, selectedCategory }: ArticlesListProps) => {
  // Фильтрация статей
  const filteredArticles = mockArticles.filter(article => {
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      {filteredArticles.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Статьи не найдены</h3>
          <p className="text-gray-500">
            {searchQuery ? 'Попробуйте изменить поисковый запрос' : 'В выбранной категории пока нет статей'}
          </p>
        </div>
      ) : (
        filteredArticles.map((article) => (
          <Card key={article.id} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {article.categoryName}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {article.readTime}
                    </div>
                  </div>
                  <CardTitle className="text-lg hover:text-primary cursor-pointer">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {article.description}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Редактировать
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {article.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Обновлено: {new Date(article.updatedAt).toLocaleDateString('ru-RU')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {article.views} просмотров
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Читать
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
