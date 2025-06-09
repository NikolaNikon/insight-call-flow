import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
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
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    // Проверяем, завершён ли onboarding
    const completed = localStorage.getItem('onboarding_completed') === 'true';
    setIsOnboardingCompleted(completed);
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
                      <div className="min-h-screen bg-gray-50">
                        <Header />
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/analytics" element={<Analytics />} />
                          <Route path="/calls" element={<Calls />} />
                          <Route path="/search" element={<Search />} />
                          <Route path="/reports" element={<Reports />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/users" element={<Users />} />
                          <Route path="/knowledge" element={<KnowledgeBase />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </div>
                    </ProtectedRoute>
                  }
                />
              </>
            )}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
