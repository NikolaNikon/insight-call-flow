
import React from 'react';
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
import { useKnowledgeBasePage } from '@/hooks/useKnowledgeBasePage';
import { CategoriesTab } from '@/components/knowledge-base/CategoriesTab';
import { RecentChangesTab } from '@/components/knowledge-base/RecentChangesTab';
import { AnalyticsTab } from '@/components/knowledge-base/AnalyticsTab';

const KnowledgeBase = () => {
  const {
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
  } = useKnowledgeBasePage();

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-4">
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
          <CategoriesTab />
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <RecentChangesTab />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsTab />
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
  );
};

export default KnowledgeBase;
