
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { useUser } from '@supabase/auth-helpers-react';
import Index from '@/pages/Index';
import Calls from '@/pages/Calls';
import AnalyticsReports from '@/pages/AnalyticsReports';
import KnowledgeBase from '@/pages/KnowledgeBase';
import Search from '@/pages/Search';
import Monitoring from '@/pages/Monitoring';
import Upload from '@/pages/Upload';
import Settings from '@/pages/Settings';
import Users from '@/pages/Users';
import Auth from '@/pages/Auth';
import TelegramAuth from '@/pages/TelegramAuth';
import TelegramTracker from '@/pages/TelegramTracker';
import Welcome from '@/pages/Welcome';
import NotFound from '@/pages/NotFound';
import KeywordTrackers from '@/pages/KeywordTrackers';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          } />
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
