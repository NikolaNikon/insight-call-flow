
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { AppShell } from '@/components/AppShell';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
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

  // Если пользователь не авторизован
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Показываем загрузку пока организация загружается
  if (orgLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Загрузка организации...</span>
        </div>
      </div>
    );
  }

  // Если произошла ошибка при загрузке организации или организация не найдена
  if (orgError || !organization) {
    // Показываем toast только один раз при ошибке
    React.useEffect(() => {
      if (!organization && !orgLoading) {
        toast({
          title: "Организация не найдена",
          description: "Обратитесь к администратору для добавления в организацию.",
          variant: "destructive",
        });
      }
    }, [organization, orgLoading, toast]);

    return <Navigate to="/welcome" replace />;
  }

  // Если все хорошо, рендерим защищенный контент
  return <AppShell>{children}</AppShell>;
};

export default ProtectedRoute;
