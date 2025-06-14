
import React from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  Edit,
  Copy,
  History,
  ArrowLeft,
  User,
  Calendar,
  Clock,
} from 'lucide-react';
import type { KnowledgeArticle, KnowledgeCategory } from '@/hooks/useKnowledgeBase';

interface ArticleViewerHeaderProps {
  article: KnowledgeArticle;
  articleCategory: KnowledgeCategory | null;
  onEdit?: (article: KnowledgeArticle) => void;
  onDuplicate?: (article: KnowledgeArticle) => void;
  onViewHistory?: (article: KnowledgeArticle) => void;
  onOpenChange: (open: boolean) => void;
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

export const ArticleViewerHeader = ({
  article,
  articleCategory,
  onEdit,
  onDuplicate,
  onViewHistory,
  onOpenChange,
}: ArticleViewerHeaderProps) => {
  return (
    <DialogHeader className="p-4 border-b">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
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
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-2 flex-wrap">
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
  );
};
