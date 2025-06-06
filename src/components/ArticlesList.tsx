
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileText, 
  Clock, 
  User, 
  Eye,
  Edit,
  Calendar
} from 'lucide-react';
import { useKnowledgeArticles, useIncrementViews } from '@/hooks/useKnowledgeBase';

interface ArticlesListProps {
  searchQuery: string;
  selectedCategory: string;
}

const statusLabels = {
  draft: 'Черновик',
  internal: 'Внутренняя',
  published: 'Опубликована'
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  internal: 'bg-blue-100 text-blue-800',
  published: 'bg-green-100 text-green-800'
};

export const ArticlesList = ({ searchQuery, selectedCategory }: ArticlesListProps) => {
  const { data: articles = [], isLoading } = useKnowledgeArticles(
    searchQuery,
    selectedCategory === 'all' ? undefined : selectedCategory
  );
  const incrementViews = useIncrementViews();

  const handleViewArticle = (articleId: string) => {
    incrementViews.mutate(articleId);
    // TODO: Открыть статью в отдельном модальном окне или на новой странице
    console.log('Открыть статью:', articleId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-9 w-24" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-9 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Статьи не найдены</h3>
        <p className="text-gray-500">
          {searchQuery ? 'Попробуйте изменить поисковый запрос' : 'В выбранной категории пока нет статей'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <Card key={article.id} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge 
                    className={`text-xs ${statusColors[article.status as keyof typeof statusColors]}`}
                  >
                    {statusLabels[article.status as keyof typeof statusLabels]}
                  </Badge>
                  {article.knowledge_categories && (
                    <Badge variant="outline" className="text-xs">
                      {(article.knowledge_categories as any).name}
                    </Badge>
                  )}
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    5 мин
                  </div>
                </div>
                <CardTitle 
                  className="text-lg hover:text-primary cursor-pointer"
                  onClick={() => handleViewArticle(article.id)}
                >
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
                  Автор
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Обновлено: {new Date(article.updated_at).toLocaleDateString('ru-RU')}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {article.view_count} просмотров
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleViewArticle(article.id)}
              >
                Читать
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
