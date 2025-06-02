
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Keyword {
  id: number;
  phrase: string;
  frequency?: number;
  created_at: string;
}

export const KeywordManager = () => {
  const [newKeyword, setNewKeyword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: keywords = [], isLoading } = useQuery({
    queryKey: ['keywords', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('keywords')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('phrase', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Keyword[];
    }
  });

  const addKeywordMutation = useMutation({
    mutationFn: async (phrase: string) => {
      const { data, error } = await supabase
        .from('keywords')
        .insert({ phrase: phrase.trim() })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keywords'] });
      setNewKeyword('');
      toast({
        title: "Ключевое слово добавлено",
        description: "Теперь оно будет отслеживаться в транскрипциях",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка добавления",
        description: error.message || "Не удалось добавить ключевое слово",
        variant: "destructive"
      });
    }
  });

  const deleteKeywordMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('keywords')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keywords'] });
      toast({
        title: "Ключевое слово удалено",
        description: "Оно больше не будет отслеживаться",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка удаления",
        description: error.message || "Не удалось удалить ключевое слово",
        variant: "destructive"
      });
    }
  });

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    
    // Проверяем, что такого ключевого слова еще нет
    const exists = keywords.some(k => k.phrase.toLowerCase() === newKeyword.trim().toLowerCase());
    if (exists) {
      toast({
        title: "Ключевое слово уже существует",
        description: "Такое ключевое слово уже добавлено в список",
        variant: "destructive"
      });
      return;
    }

    addKeywordMutation.mutate(newKeyword);
  };

  const handleDeleteKeyword = (id: number) => {
    deleteKeywordMutation.mutate(id);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddKeyword();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-blue-600" />
          Управление ключевыми словами
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Добавление нового ключевого слова */}
        <div className="flex gap-2">
          <Input
            placeholder="Введите ключевое слово..."
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button 
            onClick={handleAddKeyword}
            disabled={!newKeyword.trim() || addKeywordMutation.isPending}
          >
            <Plus className="h-4 w-4 mr-1" />
            Добавить
          </Button>
        </div>

        {/* Поиск по ключевым словам */}
        <div>
          <Input
            placeholder="Поиск ключевых слов..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Список ключевых слов */}
        <div>
          <h3 className="font-medium mb-3">
            Активные ключевые слова ({keywords.length})
          </h3>
          
          {isLoading ? (
            <div className="text-center py-4 text-gray-500">
              Загрузка ключевых слов...
            </div>
          ) : keywords.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              {searchTerm ? 'Ключевые слова не найдены' : 'Ключевые слова не добавлены'}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword) => (
                <Badge 
                  key={keyword.id} 
                  variant="secondary" 
                  className="flex items-center gap-1 px-3 py-1"
                >
                  <span>{keyword.phrase}</span>
                  {keyword.frequency && (
                    <span className="text-xs text-gray-500">({keyword.frequency})</span>
                  )}
                  <button
                    onClick={() => handleDeleteKeyword(keyword.id)}
                    className="ml-1 hover:text-red-600 transition-colors"
                    disabled={deleteKeywordMutation.isPending}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <strong>Как это работает:</strong> Добавленные ключевые слова будут автоматически отслеживаться 
          в новых транскрипциях звонков. Система будет подсчитывать частоту их упоминания и выделять 
          в результатах поиска.
        </div>
      </CardContent>
    </Card>
  );
};
