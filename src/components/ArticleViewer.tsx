
import React, { useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useIncrementViews, useKnowledgeCategories, type KnowledgeArticle } from '@/hooks/useKnowledgeBase';

import { 
  ArticleViewerHeader, 
  ArticleTableOfContents, 
  ArticleViewerContent 
} from './article-viewer';

interface ArticleViewerProps {
  article: KnowledgeArticle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (article: KnowledgeArticle) => void;
  onDuplicate?: (article: KnowledgeArticle) => void;
  onViewHistory?: (article: KnowledgeArticle) => void;
}

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

  // Находим категорию для статьи
  const articleCategory = article?.category_id ? 
    categories.find(cat => cat.id === article.category_id) : null;

  useEffect(() => {
    if (article && open) {
      incrementViews.mutate(article.id);
    }
  }, [article, open, incrementViews]);

  if (!article) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <div className="flex h-full">
          <ArticleTableOfContents content={article.content} />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <ArticleViewerHeader
              article={article}
              articleCategory={articleCategory}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              onViewHistory={onViewHistory}
              onOpenChange={onOpenChange}
            />
            <ArticleViewerContent article={article} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
