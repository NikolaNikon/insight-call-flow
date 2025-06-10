
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@supabase/auth-helpers-react';
import { useOrganization } from '@/hooks/useOrganization';
import { AppShell } from '@/components/AppShell';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const user = useUser();
  const { organization, isLoading } = useOrganization();
  const { toast } = useToast();
  const [hasCheckedOrg, setHasCheckedOrg] = useState(false);

  useEffect(() => {
    if (user && !organization && !isLoading && !hasCheckedOrg) {
      toast({
        title: "Организация не найдена",
        description: "Обратитесь к администратору для добавления в организацию.",
        variant: "destructive",
      });
      setHasCheckedOrg(true);
    }
  }, [user, organization, isLoading, toast, hasCheckedOrg]);

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

  if (!organization && hasCheckedOrg) {
    return <Navigate to="/welcome" replace />;
  }

  return <AppShell>{children}</AppShell>;
};

export default ProtectedRoute;
