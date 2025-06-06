
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  User, 
  Eye, 
  RotateCcw,
  Clock
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MarkdownRenderer } from './MarkdownRenderer';
import type { KnowledgeArticle } from '@/hooks/useKnowledgeBase';

interface ArticleVersionHistoryProps {
  article: KnowledgeArticle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestore?: (version: any) => void;
}

export const ArticleVersionHistory = ({ 
  article, 
  open, 
  onOpenChange, 
  onRestore 
}: ArticleVersionHistoryProps) => {
  const { toast } = useToast();
  const [selectedVersion, setSelectedVersion] = React.useState<any>(null);

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['article-versions', article?.id],
    queryFn: async () => {
      if (!article) return [];
      
      const { data, error } = await supabase
        .from('knowledge_article_versions')
        .select('*')
        .eq('article_id', article.id)
        .order('version_number', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!article && open,
  });

  const handleRestore = async (version: any) => {
    if (!article || !onRestore) return;
    
    try {
      // Обновляем статью содержимым из выбранной версии
      const { error } = await supabase
        .from('knowledge_articles')
        .update({
          title: version.title,
          content: version.content,
          description: version.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', article.id);

      if (error) throw error;

      toast({
        title: 'Версия восстановлена',
        description: `Статья восстановлена к версии ${version.version_number}`,
      });

      onRestore(version);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось восстановить версию',
        variant: 'destructive',
      });
    }
  };

  if (!article) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>История версий: {article.title}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 h-[calc(90vh-120px)]">
          {/* Список версий */}
          <div className="w-80">
            <h3 className="font-semibold mb-4">Версии статьи</h3>
            <ScrollArea className="h-full">
              <div className="space-y-3">
                {/* Текущая версия */}
                <Card 
                  className={`cursor-pointer transition-colors ${
                    !selectedVersion ? 'ring-2 ring-primary' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion(null)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Версия {article.version_number}</CardTitle>
                      <Badge>Текущая</Badge>
                    </div>
                    <CardDescription className="text-xs">
                      <div className="flex items-center gap-1 mb-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(article.updated_at).toLocaleString('ru-RU')}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Автор
                      </div>
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Предыдущие версии */}
                {versions.map((version) => (
                  <Card 
                    key={version.id}
                    className={`cursor-pointer transition-colors ${
                      selectedVersion?.id === version.id ? 'ring-2 ring-primary' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedVersion(version)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Версия {version.version_number}</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestore(version);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardDescription className="text-xs">
                        <div className="flex items-center gap-1 mb-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(version.created_at).toLocaleString('ru-RU')}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Автор
                        </div>
                        {version.change_summary && (
                          <div className="mt-1 text-xs text-gray-600">
                            {version.change_summary}
                          </div>
                        )}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          <Separator orientation="vertical" />

          {/* Превью версии */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">
                {selectedVersion ? `Версия ${selectedVersion.version_number}` : 'Текущая версия'}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                {selectedVersion 
                  ? new Date(selectedVersion.created_at).toLocaleString('ru-RU')
                  : new Date(article.updated_at).toLocaleString('ru-RU')
                }
              </div>
            </div>
            
            <ScrollArea className="h-full">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-lg">
                    {selectedVersion ? selectedVersion.title : article.title}
                  </h4>
                  {(selectedVersion ? selectedVersion.description : article.description) && (
                    <p className="text-gray-600 mt-1">
                      {selectedVersion ? selectedVersion.description : article.description}
                    </p>
                  )}
                </div>
                
                <Separator />
                
                <MarkdownRenderer 
                  content={selectedVersion ? selectedVersion.content : article.content}
                />
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
