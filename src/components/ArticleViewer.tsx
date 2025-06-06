
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, 
  Edit, 
  Clock, 
  User, 
  Calendar,
  Copy,
  History,
  ArrowLeft
} from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ArticleFeedback } from './ArticleFeedback';
import { useKnowledgeArticles, useIncrementViews, useKnowledgeCategories, type KnowledgeArticle } from '@/hooks/useKnowledgeBase';

interface ArticleViewerProps {
  article: KnowledgeArticle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (article: KnowledgeArticle) => void;
  onDuplicate?: (article: KnowledgeArticle) => void;
  onViewHistory?: (article: KnowledgeArticle) => void;
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

export const ArticleViewer = ({ 
  article, 
  open, 
  onOpenChange, 
  onEdit, 
  onDuplicate, 
  onViewHistory 
}: ArticleViewerProps) => {
  const incrementViews = useIncrementViews();
  const { data: categories = [] } = useKnowledgeCategories();
  const [tableOfContents, setTableOfContents] = useState<Array<{id: string, text: string, level: number}>>([]);

  // Находим категорию для статьи
  const articleCategory = article?.category_id ? 
    categories.find(cat => cat.id === article.category_id) : null;

  useEffect(() => {
    if (article && open) {
      incrementViews.mutate(article.id);
      
      // Генерируем оглавление из заголовков
      const headings = article.content.match(/^(#{1,6})\s+(.+)$/gm) || [];
      const toc = headings.map((heading, index) => {
        const level = heading.match(/^#+/)?.[0].length || 1;
        const text = heading.replace(/^#+\s+/, '');
        const id = `heading-${index}`;
        return { id, text, level };
      });
      setTableOfContents(toc);
    }
  }, [article, open, incrementViews]);

  const scrollToHeading = (headingId: string) => {
    const element = document.getElementById(headingId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!article) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <div className="flex h-full">
          {/* Боковая панель с оглавлением */}
          {tableOfContents.length > 0 && (
            <div className="w-64 border-r bg-gray-50 p-4">
              <h4 className="font-semibold text-sm text-gray-700 mb-3">Содержание</h4>
              <ScrollArea className="h-[calc(90vh-120px)]">
                <div className="space-y-1">
                  {tableOfContents.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToHeading(item.id)}
                      className={`block w-full text-left text-sm hover:bg-gray-200 p-2 rounded ${
                        item.level > 1 ? 'ml-' + ((item.level - 1) * 4) : ''
                      }`}
                      style={{ marginLeft: `${(item.level - 1) * 16}px` }}
                    >
                      {item.text}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Основной контент */}
          <div className="flex-1 flex flex-col">
            <DialogHeader className="px-6 py-4 border-b">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`text-xs ${statusColors[article.status as keyof typeof statusColors]}`}>
                      {statusLabels[article.status as keyof typeof statusLabels]}
                    </Badge>
                    {articleCategory && (
                      <Badge variant="outline" className="text-xs">
                        {articleCategory.name}
                      </Badge>
                    )}
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Eye className="h-3 w-3" />
                      {article.view_count} просмотров
                    </div>
                  </div>
                  <DialogTitle className="text-xl">{article.title}</DialogTitle>
                  {article.description && (
                    <p className="text-gray-600 mt-1">{article.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Автор
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Обновлено: {new Date(article.updated_at).toLocaleDateString('ru-RU')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Версия {article.version_number}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {onViewHistory && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewHistory(article)}
                      className="gap-2"
                    >
                      <History className="h-4 w-4" />
                      История
                    </Button>
                  )}
                  {onDuplicate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDuplicate(article)}
                      className="gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Копировать
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(article)}
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Редактировать
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenChange(false)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <ScrollArea className="flex-1 px-6 py-4">
              <div className="max-w-4xl">
                <MarkdownRenderer 
                  content={article.content} 
                  className="prose-headings:scroll-mt-4"
                  enableAnchors
                />
                
                <Separator className="my-8" />
                
                <ArticleFeedback articleId={article.id} />
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
