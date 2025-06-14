
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TelegramManagement } from '@/components/TelegramManagement';
import { TelegramWebhookManager } from '@/components/TelegramWebhookManager';
import { TelegramFeatureTracker } from '@/components/TelegramFeatureTracker';
import { TelegramIntegrationDebug } from '@/components/TelegramIntegrationDebug';
import { CrmIntegrationCard } from '@/components/CrmIntegrationCard';
import { ApiSettingsCard } from '@/components/ApiSettingsCard';
import { useUserRole } from '@/hooks/useUserRole';

export const IntegrationsTab = () => {
  const { isAdmin, isLoading } = useUserRole();

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Загрузка...</div>;
  }

  return (
    <Tabs defaultValue="main" className="space-y-4">
      <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-4' : 'grid-cols-2'}`}>
        <TabsTrigger value="main">Основные</TabsTrigger>
        <TabsTrigger value="telegram">Telegram</TabsTrigger>
        {isAdmin && <TabsTrigger value="features">Функции</TabsTrigger>}
        {isAdmin && <TabsTrigger value="debug">Отладка</TabsTrigger>}
      </TabsList>

      <TabsContent value="main" className="space-y-4">
        {isAdmin && <TelegramWebhookManager />}
        <TelegramManagement />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CrmIntegrationCard />
          <ApiSettingsCard />
        </div>
      </TabsContent>

      <TabsContent value="telegram" className="space-y-4">
        {isAdmin && <TelegramWebhookManager />}
        <TelegramManagement />
      </TabsContent>

      {isAdmin && (
        <TabsContent value="features" className="space-y-4">
          <TelegramFeatureTracker />
        </TabsContent>
      )}

      {isAdmin && (
        <TabsContent value="debug" className="space-y-4">
          <TelegramIntegrationDebug />
        </TabsContent>
      )}
    </Tabs>
  );
};
