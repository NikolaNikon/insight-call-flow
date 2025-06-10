
import React, { useEffect, useState } from 'react';
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
  const { organization, isLoading: orgLoading } = useOrganization();
  const { toast } = useToast();
  const [hasCheckedOrg, setHasCheckedOrg] = useState(false);

  // Отладочные логи
  console.log('ProtectedRoute state:', {
    user: user?.id,
    authLoading,
    organization: organization?.id,
    orgLoading,
    hasCheckedOrg
  });

  useEffect(() => {
    if (user && !organization && !orgLoading && !hasCheckedOrg) {
      console.log('User without organization detected, showing toast');
      toast({
        title: "Организация не найдена",
        description: "Обратитесь к администратору для добавления в организацию.",
        variant: "destructive",
      });
      setHasCheckedOrg(true);
    }
  }, [user, organization, orgLoading, toast, hasCheckedOrg]);

  // Показываем загрузку пока авторизация проверяется
  if (authLoading) {
    console.log('Showing auth loading state');
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
    console.log('User not authenticated, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // Показываем загрузку пока организация загружается
  if (orgLoading) {
    console.log('Showing org loading state');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Загрузка организации...</span>
        </div>
      </div>
    );
  }

  // Если у пользователя нет организации
  if (!organization && hasCheckedOrg) {
    console.log('User has no organization, redirecting to welcome');
    return <Navigate to="/welcome" replace />;
  }

  console.log('Rendering protected content');
  return <AppShell>{children}</AppShell>;
};

export default ProtectedRoute;
