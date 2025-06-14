
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
  const user = useUser();
  const { organization, isLoading } = useOrganization();
  const { toast } = useToast();
  const { isSuperAdmin, isLoading: roleLoading } = useUserRole();
  const { orgId } = useImpersonateOrg();
  const [hasCheckedOrg, setHasCheckedOrg] = useState(false);

  console.log('🛡️ ProtectedRoute:', { 
    isSuperAdmin, 
    orgId, 
    hasOrganization: !!organization,
    isLoading: isLoading || roleLoading 
  });

  // Для суперадмина: обязательно должна быть выбрана организация
  if (isSuperAdmin && !roleLoading) {
    if (!orgId) {
      console.log('🔧 Суперадмин без выбранной организации - показываем селектор');
      return <SuperadminOrgSelector />;
    }
    console.log('✅ Суперадмин с выбранной организацией - загружаем AppShell');
    // Если организация выбрана, грузим обычный shell с этой организацией
  }

  useEffect(() => {
    if (user && !organization && !isLoading && !hasCheckedOrg && !isSuperAdmin) {
      console.log('⚠️ Обычный пользователь без организации');
      toast({
        title: "Организация не найдена",
        description: "Обратитесь к администратору для добавления в организацию.",
        variant: "destructive",
      });
      setHasCheckedOrg(true);
    }
  }, [user, organization, isLoading, toast, hasCheckedOrg, isSuperAdmin]);

  if (!user) {
    console.log('🚫 Нет пользователя - редирект на авторизацию');
    return <Navigate to="/auth" replace />;
  }

  if (isLoading || roleLoading) {
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

  // Проверяем организацию только для обычных пользователей
  if (!organization && hasCheckedOrg && !isSuperAdmin) {
    console.log('🔄 Обычный пользователь без организации - редирект на welcome');
    return <Navigate to="/welcome" replace />;
  }

  console.log('🎯 Загружаем AppShell для пользователя');
  // Стандартный AppShell для всех обычных пользователей и суперадмина с выбранной организацией
  return <AppShell>{children}</AppShell>;
};

export default ProtectedRoute;
