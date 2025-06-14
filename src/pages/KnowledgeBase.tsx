
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, BookOpen, History, Settings as SettingsIcon } from 'lucide-react';
import { KnowledgeBaseHeader } from '@/components/KnowledgeBaseHeader';
import { ArticlesList } from '@/components/ArticlesList';
import { CreateArticleDialog } from '@/components/CreateArticleDialog';
import { ArticleCategories } from '@/components/ArticleCategories';
import { ArticleViewer } from '@/components/ArticleViewer';
import { ArticleVersionHistory } from '@/components/ArticleVersionHistory';
import { useToast } from '@/hooks/use-toast';
import { useCreateArticle, type KnowledgeArticle } from '@/hooks/useKnowledgeBase';

const KnowledgeBase = () => {
  const { toast } = useToast();
  const createArticle = useCreateArticle();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Состояния для просмотра статей
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
    // Обновляем данные после восстановления версии
    setIsVersionHistoryOpen(false);
    toast({
      title: 'Версия восстановлена',
      description: 'Статья была успешно восстановлена к выбранной версии',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <KnowledgeBaseHeader />

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Поиск в базе знаний..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Button 
            onClick={() => {
              setEditingArticle(null);
              setIsCreateDialogOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Добавить статью
          </Button>
        </div>

        <Tabs defaultValue="articles" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="articles" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Статьи
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <SettingsIcon className="h-4 w-4" />
              Категории
            </TabsTrigger>
            <TabsTrigger value="recent" className="gap-2">
              <History className="h-4 w-4" />
              Последние изменения
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Аналитика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="space-y-4">
            <div className="flex gap-6">
              <div className="w-64">
                <ArticleCategories 
                  selectedCategory={selectedCategory}
                  onCategorySelect={setSelectedCategory}
                />
              </div>
              <div className="flex-1">
                <ArticlesList 
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                  onViewArticle={handleViewArticle}
                  onEditArticle={handleEditArticle}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
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
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-lg font-semibold text-graphite mb-4">Последние изменения</h3>
              <p className="text-gray-600">
                История изменений и обновлений статей в базе знаний.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-lg font-semibold text-graphite mb-4">Аналитика базы знаний</h3>
              <p className="text-gray-600">
                Статистика просмотров, популярные статьи и анализ пользовательского фидбека.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Диалоги */}
        <CreateArticleDialog 
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          editingArticle={editingArticle}
        />

        <ArticleViewer
          article={selectedArticle}
          open={isArticleViewerOpen}
          onOpenChange={setIsArticleViewerOpen}
          onEdit={handleEditArticle}
          onDuplicate={handleDuplicateArticle}
          onViewHistory={handleViewHistory}
        />

        <ArticleVersionHistory
          article={selectedArticle}
          open={isVersionHistoryOpen}
          onOpenChange={setIsVersionHistoryOpen}
          onRestore={handleRestoreVersion}
        />
      </div>
    </div>
  );
};

export default KnowledgeBase;
