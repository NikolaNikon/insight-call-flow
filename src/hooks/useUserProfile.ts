
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useUserProfile = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const ensureUserProfile = async () => {
    setIsCreating(true);
    
    try {
      console.log('Ensuring user profile exists...');
      
      const { data, error } = await supabase.functions.invoke('create-user-profile');

      console.log('Function response:', data, error);

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!data || !data.success) {
        const errorMessage = data?.error || 'Неизвестная ошибка';
        console.error('Function returned error:', errorMessage);
        throw new Error(errorMessage);
      }

      return data;
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка при создании профиля';
      console.error('Error in ensureUserProfile:', error);
      
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive"
      });

      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    ensureUserProfile,
    isCreating
  };
};
