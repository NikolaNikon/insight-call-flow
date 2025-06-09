import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { useUser } from '@supabase/auth-helpers-react';
import { Index } from '@/pages/Index';
import { Calls } from '@/pages/Calls';
import { AnalyticsReports } from '@/pages/AnalyticsReports';
import { KnowledgeBase } from '@/pages/KnowledgeBase';
import { Search } from '@/pages/Search';
import { Monitoring } from '@/pages/Monitoring';
import { Upload } from '@/pages/Upload';
import { Settings } from '@/pages/Settings';
import { Users } from '@/pages/Users';
import { Auth } from '@/pages/Auth';
import { TelegramAuth } from '@/pages/TelegramAuth';
import { TelegramTracker } from '@/pages/TelegramTracker';
import { Welcome } from '@/pages/Welcome';
import { NotFound } from '@/pages/NotFound';
import { AppShell } from '@/components/AppShell';
import { useOrganization } from '@/hooks/useOrganization';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, BookOpen, FileBarChart, Phone, Search as SearchIcon, Activity, Upload as UploadIcon, Users as UsersIcon, Settings as SettingsIcon } from 'lucide-react';
import { SidebarLink } from '@/components/SidebarLink';
import { KeywordTrackers } from '@/pages/KeywordTrackers';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
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
      setHasCheckedOrg(true); // Ensure this effect runs only once
    }
  }, [user, organization, isLoading, toast, hasCheckedOrg]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Если у пользователя нет организации, и мы уже проверили это, перенаправляем
  if (!organization && hasCheckedOrg) {
    return <Navigate to="/welcome" replace />;
  }

  return <AppShell>{children}</AppShell>;
};

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/calls" element={
            <ProtectedRoute>
              <Calls />
            </ProtectedRoute>
          } />
          <Route path="/keyword-trackers" element={
            <ProtectedRoute>
              <KeywordTrackers />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <AnalyticsReports />
            </ProtectedRoute>
          } />
          <Route path="/knowledge-base" element={
            <ProtectedRoute>
              <KnowledgeBase />
            </ProtectedRoute>
          } />
          <Route path="/search" element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          } />
          <Route path="/monitoring" element={
            <ProtectedRoute>
              <Monitoring />
            </ProtectedRoute>
          } />
          <Route path="/upload" element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          } />
          <Route path="/auth" element={<Auth />} />
          <Route path="/telegram-auth" element={<TelegramAuth />} />
          <Route path="/telegram-tracker" element={<TelegramTracker />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </>
  );
}

export default App;
