import React, { useState } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Info } from 'lucide-react';
import { useTelegramSession } from '@/hooks/useTelegramSession';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { TelegramActiveConnections } from '@/components/telegram/TelegramActiveConnections';
import { useOrganization } from '@/hooks/useOrganization';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { TelegramStatusChecker } from '@/components/TelegramStatusChecker';

export const ImprovedTelegramIntegration = () => {
  const [currentSessionCode, setCurrentSessionCode] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  
  const { organization } = useOrganization();
  const { startTelegramSession, isGeneratingSession } = useTelegramSession();
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
      if (result.telegram_url) {
        window.open(result.telegram_url, '_blank');
      }
    }
  };

  const handleConnectionComplete = () => {
    setCurrentSessionCode(null);
    setSessionData(null);
    refetchLinks();
  };

  const handleCancelPending = () => {
    setCurrentSessionCode(null);
    setSessionData(null);
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
    <div className="space-y-4">
      {linksLoading ? (
        <div className="flex items-center justify-center gap-2 p-4 text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Загрузка подключений...</span>
        </div>
      ) : isConnected ? (
        <TelegramActiveConnections
          links={telegramLinks}
          onDeactivate={handleDeactivate}
          onRefresh={refetchLinks}
          loading={linksLoading}
        />
      ) : isPending && sessionData ? (
        <TelegramStatusChecker
          sessionCode={currentSessionCode}
          telegramUrl={sessionData.telegram_url}
          onConnected={handleConnectionComplete}
          onCancel={handleCancelPending}
          pollingEnabled={true}
        />
      ) : (
        <>
          <div className="flex items-center justify-between rounded-lg border bg-slate-50 p-4">
            <div>
              <p className="font-medium">Подключить Telegram</p>
              <p className="text-sm text-gray-500">
                Получайте уведомления о звонках и отчеты.
              </p>
            </div>
            <Button
              onClick={handleStartConnection}
              disabled={isGeneratingSession}
              size="sm"
            >
              {isGeneratingSession ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Генерация...
                </>
              ) : (
                'Подключить'
              )}
            </Button>
          </div>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button
                variant="link"
                className="flex h-auto items-center gap-1 p-0 text-sm text-gray-600"
              >
                <Info className="h-4 w-4" />
                Как это работает?
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <p className="text-sm font-medium">Инструкция по подключению:</p>
                <ol className="list-inside list-decimal space-y-1 text-xs text-gray-700">
                  <li>Нажмите "Подключить" для генерации ссылки.</li>
                  <li>Перейдите по ссылке, откроется Telegram.</li>
                  <li>Нажмите "Запустить" или отправьте команду /start.</li>
                  <li>Готово! Теперь вы будете получать уведомления.</li>
                </ol>
              </div>
            </HoverCardContent>
          </HoverCard>
        </>
      )}
    </div>
  );
};
