
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Welcome from "./pages/Welcome";
import Analytics from "./pages/Analytics";
import Calls from "./pages/Calls";
import Search from "./pages/Search";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import KnowledgeBase from "./pages/KnowledgeBase";
import NotFound from "./pages/NotFound";
import UpdatedHeader from "./components/UpdatedHeader";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    // Проверяем, завершён ли onboarding
    const completed = localStorage.getItem('onboarding_completed') === 'true';
    setIsOnboardingCompleted(completed);

    // Слушаем изменения в localStorage для обновления состояния
    const handleStorageChange = () => {
      const completed = localStorage.getItem('onboarding_completed') === 'true';
      setIsOnboardingCompleted(completed);
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Также слушаем кастомное событие для обновления в том же окне
    const handleOnboardingComplete = () => {
      setIsOnboardingCompleted(true);
    };
    
    window.addEventListener('onboardingCompleted', handleOnboardingComplete);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('onboardingCompleted', handleOnboardingComplete);
    };
  }, []);

  // Показываем загрузку пока проверяем статус onboarding
  if (isOnboardingCompleted === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Загрузка...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Маршрут для welcome/onboarding */}
              <Route 
                path="/welcome" 
                element={!isOnboardingCompleted ? <Welcome /> : <Navigate to="/" replace />} 
              />
              
              {/* Перенаправление на welcome если onboarding не завершён */}
              {!isOnboardingCompleted && (
                <Route path="*" element={<Navigate to="/welcome" replace />} />
              )}
              
              {/* Основные маршруты приложения (после onboarding) */}
              {isOnboardingCompleted && (
                <>
                  <Route path="/auth" element={<Auth />} />
                  <Route
                    path="/*"
                    element={
                      <ProtectedRoute>
                        <SidebarProvider>
                          <div className="min-h-screen flex w-full">
                            <AppSidebar />
                            <SidebarInset>
                              <UpdatedHeader />
                              <main className="flex-1 p-6">
                                <Routes>
                                  <Route path="/" element={<Index />} />
                                  <Route path="/analytics" element={<Analytics />} />
                                  <Route path="/calls" element={<Calls />} />
                                  <Route path="/search" element={<Search />} />
                                  <Route path="/reports" element={<Reports />} />
                                  <Route path="/settings" element={<Settings />} />
                                  <Route path="/users" element={<Users />} />
                                  <Route path="/knowledge-base" element={<KnowledgeBase />} />
                                  <Route path="*" element={<NotFound />} />
                                </Routes>
                              </main>
                            </SidebarInset>
                          </div>
                        </SidebarProvider>
                      </ProtectedRoute>
                    }
                  />
                </>
              )}
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
