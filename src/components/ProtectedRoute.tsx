
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@supabase/auth-helpers-react';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { SuperadminOrgSelector } from './SuperadminOrgSelector';
import { useImpersonateOrg } from "@/hooks/useImpersonateOrg";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const user = useUser();
  const { organization, isLoading } = useOrganization();
  const { toast } = useToast();
  const { isSuperAdmin } = useUserRole();
  const { orgId } = useImpersonateOrg();
  const [hasCheckedOrg, setHasCheckedOrg] = useState(false);

  // Для суперадмина обязательно должна быть выбрана организация
  if (isSuperAdmin) {
    if (!orgId) {
      return <SuperadminOrgSelector />;
    }
    // Если организация выбрана, грузим обычный shell с этой организацией
    // ... не делаем редирект на welcome, просто идем дальше
  }

  useEffect(() => {
    if (user && !organization && !isLoading && !hasCheckedOrg && !isSuperAdmin) {
      toast({
        title: "Организация не найдена",
        description: "Обратитесь к администратору для добавления в организацию.",
        variant: "destructive",
      });
      setHasCheckedOrg(true);
    }
  }, [user, organization, isLoading, toast, hasCheckedOrg, isSuperAdmin]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Загрузка...</span>
        </div>
      </div>
    );
  }

  if (!organization && hasCheckedOrg && !isSuperAdmin) {
    return <Navigate to="/welcome" replace />;
  }

  // Стандартный AppShell для всех обычных пользователей и суперадмина с выбранной организацией
  const AppShell = require('@/components/AppShell').AppShell;
  return <AppShell>{children}</AppShell>;
};

export default ProtectedRoute;
