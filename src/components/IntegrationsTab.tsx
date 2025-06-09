
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TelegramManagement } from '@/components/TelegramManagement';
import { TelegramWebhookManager } from '@/components/TelegramWebhookManager';
import { TelegramFeatureTracker } from '@/components/TelegramFeatureTracker';
import { TelegramIntegrationDebug } from '@/components/TelegramIntegrationDebug';
import { CrmIntegrationCard } from '@/components/CrmIntegrationCard';
import { ApiSettingsCard } from '@/components/ApiSettingsCard';

export const IntegrationsTab = () => {
  return (
    <Tabs defaultValue="main" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="main">Основные</TabsTrigger>
        <TabsTrigger value="telegram">Telegram</TabsTrigger>
        <TabsTrigger value="features">Функции</TabsTrigger>
        <TabsTrigger value="debug">Отладка</TabsTrigger>
      </TabsList>

      <TabsContent value="main" className="space-y-6">
        <TelegramWebhookManager />
        <TelegramManagement />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CrmIntegrationCard />
          <ApiSettingsCard />
        </div>
      </TabsContent>

      <TabsContent value="telegram" className="space-y-6">
        <TelegramWebhookManager />
        <TelegramManagement />
      </TabsContent>

      <TabsContent value="features" className="space-y-6">
        <TelegramFeatureTracker />
      </TabsContent>

      <TabsContent value="debug" className="space-y-6">
        <TelegramIntegrationDebug />
      </TabsContent>
    </Tabs>
  );
};
