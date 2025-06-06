
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, BookOpen } from 'lucide-react';
import { KnowledgeBaseHeader } from '@/components/KnowledgeBaseHeader';
import { ArticlesList } from '@/components/ArticlesList';
import { CreateArticleDialog } from '@/components/CreateArticleDialog';
import { ArticleCategories } from '@/components/ArticleCategories';

const KnowledgeBase = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
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
            onClick={() => setIsCreateDialogOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Добавить статью
          </Button>
        </div>

        <Tabs defaultValue="articles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="articles" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Статьи
            </TabsTrigger>
            <TabsTrigger value="categories">Категории</TabsTrigger>
            <TabsTrigger value="recent">Последние изменения</TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="space-y-6">
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
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-graphite mb-4">Управление категориями</h3>
              <p className="text-gray-600">Раздел управления категориями будет реализован в следующих версиях.</p>
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-graphite mb-4">Последние изменения</h3>
              <p className="text-gray-600">История изменений документации будет доступна в следующих версиях.</p>
            </div>
          </TabsContent>
        </Tabs>

        <CreateArticleDialog 
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />
      </div>
    </div>
  );
};

export default KnowledgeBase;
