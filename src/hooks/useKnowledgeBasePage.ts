
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCreateArticle, type KnowledgeArticle } from '@/hooks/useKnowledgeBase';

export const useKnowledgeBasePage = () => {
  const { toast } = useToast();
  const createArticle = useCreateArticle();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [isArticleViewerOpen, setIsArticleViewerOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<KnowledgeArticle | null>(null);

  const handleViewArticle = (article: KnowledgeArticle) => {
    setSelectedArticle(article);
    setIsArticleViewerOpen(true);
  };

  const handleEditArticle = (article: KnowledgeArticle) => {
    setEditingArticle(article);
    setSelectedArticle(null);
    setIsArticleViewerOpen(false);
    setIsCreateDialogOpen(true);
  };

  const handleDuplicateArticle = async (article: KnowledgeArticle) => {
    try {
      await createArticle.mutateAsync({
        title: `${article.title} (копия)`,
        content: article.content,
        description: article.description,
        category_id: article.category_id || undefined,
        template: article.template,
        status: 'draft'
      });
      
      setIsArticleViewerOpen(false);
      
      toast({
        title: 'Статья скопирована',
        description: 'Создана копия статьи в статусе "Черновик"',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось скопировать статью',
        variant: 'destructive',
      });
    }
  };

  const handleViewHistory = (article: KnowledgeArticle) => {
    setSelectedArticle(article);
    setIsArticleViewerOpen(false);
    setIsVersionHistoryOpen(true);
  };

  const handleRestoreVersion = () => {
    setIsVersionHistoryOpen(false);
    toast({
      title: 'Версия восстановлена',
      description: 'Статья была успешно восстановлена к выбранной версии',
    });
  };

  return {
    searchQuery,
    setSearchQuery,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    selectedCategory,
    setSelectedCategory,
    selectedArticle,
    isArticleViewerOpen,
    setIsArticleViewerOpen,
    isVersionHistoryOpen,
    setIsVersionHistoryOpen,
    editingArticle,
    setEditingArticle,
    handleViewArticle,
    handleEditArticle,
    handleDuplicateArticle,
    handleViewHistory,
    handleRestoreVersion,
  };
};
