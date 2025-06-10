
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
  console.log('ProtectedRoute rendering...');
  
  const user = useUser();
  const { organization, isLoading } = useOrganization();
  const { toast } = useToast();
  const [hasCheckedOrg, setHasCheckedOrg] = useState(false);

  console.log('ProtectedRoute state:', {
    user: user?.email || 'No user',
    organization: organization?.name || 'No organization',
    isLoading,
    hasCheckedOrg
  });

  useEffect(() => {
    if (user && !organization && !isLoading && !hasCheckedOrg) {
      console.log('Showing organization not found toast');
      toast({
        title: "Организация не найдена",
        description: "Обратитесь к администратору для добавления в организацию.",
        variant: "destructive",
      });
      setHasCheckedOrg(true);
    }
  }, [user, organization, isLoading, toast, hasCheckedOrg]);

  if (!user) {
    console.log('No user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  if (isLoading) {
    console.log('Loading organization...');
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
    console.log('No organization found, redirecting to welcome');
    return <Navigate to="/welcome" replace />;
  }

  console.log('ProtectedRoute rendering children with AppShell');
  return <AppShell>{children}</AppShell>;
};

export default ProtectedRoute;
