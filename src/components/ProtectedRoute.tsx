
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@supabase/auth-helpers-react';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { SuperadminOrgSelector } from './SuperadminOrgSelector';
import { useImpersonateOrg } from "@/hooks/useImpersonateOrg";
import { AppShell } from '@/components/AppShell';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // ВСЕ ХУКИ ДОЛЖНЫ БЫТЬ ВЫЗВАНЫ БЕЗУСЛОВНО В НАЧАЛЕ КОМПОНЕНТА
  const user = useUser();
  const { organization, isLoading: orgLoading } = useOrganization();
  const { toast } = useToast();
  const { isSuperAdmin, isLoading: roleLoading } = useUserRole();
  const { orgId } = useImpersonateOrg();
  const [hasCheckedOrg, setHasCheckedOrg] = useState(false);

  // useEffect тоже должен вызываться безусловно
  // Показываем уведомление ТОЛЬКО обычным пользователям (не суперадминам)
  useEffect(() => {
    if (user && !organization && !hasCheckedOrg && !isSuperAdmin && !roleLoading) {
      console.log('⚠️ Обычный пользователь без организации');
      toast({
        title: "Организация не найдена",
        description: "Обратитесь к администратору для добавления в организацию.",
        variant: "destructive",
      });
      setHasCheckedOrg(true);
    }
  }, [user, organization, hasCheckedOrg, isSuperAdmin, roleLoading, toast]);

  console.log('🛡️ ProtectedRoute:', { 
    isSuperAdmin, 
    orgId, 
    hasOrganization: !!organization,
    isLoading: orgLoading || roleLoading 
  });

  // Теперь можно делать условные возвраты
  if (!user) {
    console.log('🚫 Нет пользователя - редирект на авторизацию');
    return <Navigate to="/auth" replace />;
  }

  if (roleLoading || orgLoading) {
    console.log('⏳ Загрузка данных пользователя/организации');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Загрузка...</span>
        </div>
      </div>
    );
  }

  // Для суперадмина: если нет организации, показываем селектор
  if (isSuperAdmin && !organization) {
    console.log('🔧 Суперадмин без организации - показываем селектор');
    return <SuperadminOrgSelector />;
  }

  // Проверяем организацию только для обычных пользователей
  if (!organization && hasCheckedOrg && !isSuperAdmin) {
    console.log('🔄 Обычный пользователь без организации - редирект на welcome');
    return <Navigate to="/welcome" replace />;
  }

  console.log('🎯 Загружаем AppShell для пользователя');
  // Стандартный AppShell для всех пользователей с организацией
  return <AppShell>{children}</AppShell>;
};

export default ProtectedRoute;
