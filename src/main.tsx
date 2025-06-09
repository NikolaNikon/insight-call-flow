
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { supabase } from '@/integrations/supabase/client'
import { AuthProvider } from '@/hooks/useAuth'
import App from './App.tsx'
import './index.css'

// Создаем QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 минут
      retry: 1,
    },
  },
})

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <SessionContextProvider supabaseClient={supabase}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </SessionContextProvider>
  </QueryClientProvider>
);
