
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ArticleTemplateSelector } from './ArticleTemplateSelector';
import { MarkdownRenderer } from './MarkdownRenderer';
import { useKnowledgeCategories, useCreateArticle } from '@/hooks/useKnowledgeBase';

interface CreateArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateArticleDialog = ({ open, onOpenChange }: CreateArticleDialogProps) => {
  const { toast } = useToast();
  const { data: categories = [] } = useKnowledgeCategories();
  const createArticle = useCreateArticle();
  
  const [step, setStep] = useState<'template' | 'content'>('template');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    content: '',
    template: 'general' as const,
    status: 'draft' as const
  });

  const handleTemplateSelect = (template: string, content: string) => {
    setFormData(prev => ({
      ...prev,
      template: template as any,
      content
    }));
    setStep('content');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category_id) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    try {
      await createArticle.mutateAsync(formData);
      
      // Сброс формы
      setFormData({
        title: '',
        description: '',
        category_id: '',
        content: '',
        template: 'general',
        status: 'draft'
      });
      setStep('template');
      onOpenChange(false);
    } catch (error) {
      console.error('Ошибка создания статьи:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {step === 'template' ? 'Выберите шаблон статьи' : 'Создать новую статью'}
          </DialogTitle>
          <DialogDescription>
            {step === 'template' 
              ? 'Выберите подходящий шаблон для вашей статьи'
              : 'Заполните информацию о статье и её содержание'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {step === 'template' ? (
            <ArticleTemplateSelector onSelect={handleTemplateSelect} />
          ) : (
            <form onSubmit={handleSubmit} className="h-full flex flex-col">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Заголовок *</Label>
                  <Input
                    id="title"
                    placeholder="Введите заголовок статьи"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Категория *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <Label htmlFor="description">Краткое описание *</Label>
                <Textarea
                  id="description"
                  placeholder="Краткое описание содержания статьи"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="flex-1 overflow-hidden">
                <Label className="text-sm font-medium">Содержание</Label>
                <Tabs defaultValue="edit" className="h-full mt-2">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="edit">Редактирование</TabsTrigger>
                    <TabsTrigger value="preview">Предпросмотр</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="edit" className="h-[400px] mt-2">
                    <Textarea
                      placeholder="Введите содержание статьи (поддерживается Markdown)"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      className="h-full resize-none"
                    />
                  </TabsContent>
                  
                  <TabsContent value="preview" className="h-[400px] mt-2 overflow-auto border rounded-md p-4">
                    <MarkdownRenderer content={formData.content} />
                  </TabsContent>
                </Tabs>
              </div>

              <DialogFooter className="mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep('template')}
                >
                  Назад
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                >
                  Отмена
                </Button>
                <Button 
                  type="submit"
                  disabled={createArticle.isPending}
                >
                  {createArticle.isPending ? 'Создание...' : 'Создать статью'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
