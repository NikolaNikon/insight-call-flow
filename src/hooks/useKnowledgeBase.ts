
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

export type KnowledgeArticle = Tables<'knowledge_articles'>;
export type KnowledgeCategory = Tables<'knowledge_categories'>;
export type ArticleFeedback = Tables<'knowledge_feedback'>;

export const useKnowledgeCategories = () => {
  return useQuery({
    queryKey: ['knowledge-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_categories')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      return data;
    },
  });
};

export const useKnowledgeArticles = (searchQuery?: string, categoryId?: string, status?: string) => {
  return useQuery({
    queryKey: ['knowledge-articles', searchQuery, categoryId, status],
    queryFn: async () => {
      let query = supabase
        .from('knowledge_articles')
        .select(`
          *,
          knowledge_categories(name, slug)
        `)
        .order('updated_at', { ascending: false });

      if (categoryId && categoryId !== 'all') {
        query = query.eq('category_id', categoryId);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (searchQuery) {
        query = query.textSearch('title,description,content', searchQuery);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateArticle = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (article: Partial<KnowledgeArticle>) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Пользователь не авторизован');

      const slug = article.title?.toLowerCase()
        .replace(/[^а-яёa-z0-9\s]/g, '')
        .replace(/\s+/g, '-') || '';

      const { data, error } = await supabase
        .from('knowledge_articles')
        .insert({
          ...article,
          author_id: user.user.id,
          slug: `${slug}-${Date.now()}`,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-articles'] });
      toast({
        title: 'Статья создана',
        description: 'Новая статья была успешно добавлена в базу знаний',
      });
    },
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать статью',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateArticle = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<KnowledgeArticle> & { id: string }) => {
      const { data, error } = await supabase
        .from('knowledge_articles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-articles'] });
      toast({
        title: 'Статья обновлена',
        description: 'Изменения были успешно сохранены',
      });
    },
  });
};

export const useSubmitFeedback = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (feedback: Partial<ArticleFeedback>) => {
      const { data, error } = await supabase
        .from('knowledge_feedback')
        .insert(feedback)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article-feedback'] });
      toast({
        title: 'Спасибо за отзыв!',
        description: 'Ваше мнение поможет нам улучшить документацию',
      });
    },
  });
};

export const useIncrementViews = () => {
  return useMutation({
    mutationFn: async (articleId: string) => {
      const { error } = await supabase.rpc('increment_article_views', {
        article_id: articleId,
      });
      if (error) throw error;
    },
  });
};
