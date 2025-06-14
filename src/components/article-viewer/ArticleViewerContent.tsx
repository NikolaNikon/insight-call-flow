
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { ArticleFeedback } from '../ArticleFeedback';
import type { KnowledgeArticle } from '@/hooks/useKnowledgeBase';

interface ArticleViewerContentProps {
  article: KnowledgeArticle;
}

export const ArticleViewerContent = ({ article }: ArticleViewerContentProps) => {
  return (
    <ScrollArea className="flex-1">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <MarkdownRenderer 
          content={article.content} 
          className="prose-headings:scroll-mt-4"
          enableAnchors
        />
        
        <Separator className="my-8" />
        
        <ArticleFeedback articleId={article.id} />
      </div>
    </ScrollArea>
  );
};
