
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Calls from "./pages/Calls";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import UpdatedHeader from "./components/UpdatedHeader";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <div className="min-h-screen flex w-full">
                      <AppSidebar />
                      <SidebarInset>
                        <div className="flex-1 flex flex-col">
                          <UpdatedHeader />
                          <main className="flex-1">
                            <Routes>
                              <Route path="/" element={<Index />} />
                              <Route path="/calls" element={<Calls />} />
                              <Route path="/analytics" element={<Analytics />} />
                              <Route path="/reports" element={<Reports />} />
                              <Route path="/settings" element={<Settings />} />
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </main>
                        </div>
                      </SidebarInset>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
