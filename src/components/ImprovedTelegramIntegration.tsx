
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Bot } from 'lucide-react';
import { useTelegramSessionOrg } from '@/hooks/useTelegramSessionOrg';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { TelegramConnectionStatus } from '@/components/telegram/TelegramConnectionStatus';
import { TelegramPendingSession } from '@/components/telegram/TelegramPendingSession';
import { TelegramActiveConnections } from '@/components/telegram/TelegramActiveConnections';
import { useOrganization } from '@/hooks/useOrganization';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const ImprovedTelegramIntegration = () => {
  const [currentSessionCode, setCurrentSessionCode] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  
  const { startTelegramSession, isGeneratingSession, organization } = useTelegramSessionOrg();
  const { deactivateTelegramLink } = useTelegramAuth();

  // Загружаем активные подключения Telegram для организации
  const { data: telegramLinks = [], refetch: refetchLinks, isLoading: linksLoading } = useQuery({
    queryKey: ['telegram-links', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];

      const { data, error } = await supabase
        .from('telegram_links')
        .select('*')
        .eq('org_id', organization.id)
        .eq('active', true);

      if (error) {
        console.error('Error fetching telegram links:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!organization?.id
  });

  const handleStartConnection = async () => {
    const result = await startTelegramSession();
    if (result && result.success) {
      setCurrentSessionCode(result.session_code || null);
      setSessionData(result);
    }
  };

  const handleConnectionComplete = () => {
    setCurrentSessionCode(null);
    setSessionData(null);
    refetchLinks();
  };

  const handleDeactivate = async (linkId: string) => {
    const success = await deactivateTelegramLink(linkId);
    if (success) {
      refetchLinks();
    }
  };

  if (!organization) {
    return (
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-600">Организация не найдена</CardTitle>
          <CardDescription>
            Необходимо настроить организацию для работы с Telegram
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isConnected = telegramLinks.length > 0;
  const isPending = !!currentSessionCode;

  return (
    <div className="space-y-6">
      {/* Organization Context */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Bot className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">
            Подключение для организации: {organization.name}
          </span>
        </div>
        <p className="text-xs text-blue-600">
          Все уведомления будут отправляться через бота вашей организации
        </p>
      </div>

      {/* Connection Status */}
      <TelegramConnectionStatus
        isConnected={isConnected}
        isPending={isPending}
        error={null}
        showTimeoutWarning={false}
      />

      {/* Active Connections */}
      <TelegramActiveConnections
        links={telegramLinks}
        onDeactivate={handleDeactivate}
        onRefresh={refetchLinks}
        loading={linksLoading}
      />

      {/* Pending Session */}
      {currentSessionCode && sessionData && (
        <TelegramPendingSession
          pendingSession={{
            session_code: currentSessionCode,
            telegram_url: sessionData.telegram_url,
            expires_at: sessionData.expires_at
          }}
          timeLeft={300} // 5 минут
          showTimeoutWarning={false}
          onCancel={handleConnectionComplete}
        />
      )}

      {/* Connect Button */}
      {!currentSessionCode && (
        <div className="flex gap-3">
          <Button
            onClick={handleStartConnection}
            disabled={isGeneratingSession}
            className="flex-1"
          >
            {isGeneratingSession ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Генерация ссылки...
              </>
            ) : (
              <>
                <Bot className="mr-2 h-4 w-4" />
                Подключить Telegram
              </>
            )}
          </Button>
        </div>
      )}

      {/* Help Text */}
      <div className="text-sm text-gray-600 space-y-2">
        <p className="font-medium">Как это работает:</p>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>Нажмите "Подключить Telegram" для генерации персональной ссылки</li>
          <li>Перейдите по ссылке или нажмите на неё - откроется Telegram</li>
          <li>Нажмите "Запустить бота" или отправьте команду /start</li>
          <li>Подтвердите подключение в появившемся диалоге</li>
          <li>Готово! Теперь вы будете получать уведомления о звонках</li>
        </ol>
      </div>
    </div>
  );
};
