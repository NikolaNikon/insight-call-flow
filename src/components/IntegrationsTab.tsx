
import React from 'react';
import { TelegramIntegrationCard } from '@/components/TelegramIntegrationCard';
import { TelegramManagement } from '@/components/TelegramManagement';
import { TelegramWebhookManager } from '@/components/TelegramWebhookManager';
import { CrmIntegrationCard } from '@/components/CrmIntegrationCard';
import { ApiSettingsCard } from '@/components/ApiSettingsCard';

export const IntegrationsTab = () => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <TelegramWebhookManager />
      <TelegramManagement />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TelegramIntegrationCard />
        <CrmIntegrationCard />
        <ApiSettingsCard />
      </div>
    </div>
  );
};
