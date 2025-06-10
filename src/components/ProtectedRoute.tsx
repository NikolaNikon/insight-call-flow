
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { AppShell } from '@/components/AppShell';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { organization, isLoading: orgLoading, error: orgError } = useOrganization();
  const { toast } = useToast();

  // Показываем загрузку пока авторизация проверяется
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Проверка авторизации...</span>
        </div>
      </div>
    );
  }

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Показываем загрузку пока организация загружается
  if (orgLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Загрузка данных организации...</span>
        </div>
      </div>
    );
  }

  // Если произошла ошибка при загрузке организации
  if (orgError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Ошибка загрузки организации</h2>
            <p className="text-gray-600 mt-2">Произошла ошибка при загрузке данных организации</p>
          </div>
          <div className="space-x-2">
            <Button onClick={() => window.location.reload()} variant="outline">
              Обновить страницу
            </Button>
            <Button onClick={signOut} variant="destructive">
              Выйти из системы
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Если организация не найдена
  if (!organization) {
    React.useEffect(() => {
      toast({
        title: "Организация не найдена",
        description: "Обратитесь к администратору для добавления в организацию.",
        variant: "destructive",
      });
    }, [toast]);

    return <Navigate to="/welcome" replace />;
  }

  // Если все хорошо, рендерим защищенный контент
  return <AppShell>{children}</AppShell>;
};

export default ProtectedRoute;
