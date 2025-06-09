
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, CheckCircle, XCircle, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { useTelegramWebhook } from '@/hooks/useTelegramWebhook';

export const TelegramWebhookManager = () => {
  const { 
    setWebhook, 
    getWebhookInfo, 
    deleteWebhook, 
    testBot, 
    isLoading, 
    webhookInfo, 
    botInfo 
  } = useTelegramWebhook();
  
  const [webhookStatus, setWebhookStatus] = useState<{
    isCorrect: boolean;
    expectedUrl: string;
  } | null>(null);

  useEffect(() => {
    checkWebhookStatus();
    checkBotStatus();
  }, []);

  const checkWebhookStatus = async () => {
    const result = await getWebhookInfo();
    if (result) {
      setWebhookStatus({
        isCorrect: result.isCorrect,
        expectedUrl: result.expectedUrl
      });
    }
  };

  const checkBotStatus = async () => {
    await testBot();
  };

  const handleSetupWebhook = async () => {
    const success = await setWebhook();
    if (success) {
      await checkWebhookStatus();
    }
  };

  const handleDeleteWebhook = async () => {
    const success = await deleteWebhook();
    if (success) {
      setWebhookStatus(null);
    }
  };

  const renderWebhookStatus = () => {
    if (!webhookInfo) {
      return (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            ⚠️ Webhook не настроен. Бот не сможет получать сообщения.
          </AlertDescription>
        </Alert>
      );
    }

    if (webhookStatus?.isCorrect) {
      return (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ✅ Webhook настроен корректно
          </AlertDescription>
        </Alert>
      );
    } else {
      return (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            ❌ Webhook настроен неправильно. Ожидается: {webhookStatus?.expectedUrl}
          </AlertDescription>
        </Alert>
      );
    }
  };

  const renderBotStatus = () => {
    if (!botInfo) {
      return (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            ❌ Не удалось подключиться к боту. Проверьте токен.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          ✅ Бот активен: @{botInfo.username} ({botInfo.first_name})
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Настройка Telegram Webhook
        </CardTitle>
        <CardDescription>
          Управление webhook для корректной работы Telegram бота
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm">Статус бота:</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={checkBotStatus}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          {renderBotStatus()}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm">Статус Webhook:</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={checkWebhookStatus}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          {renderWebhookStatus()}
        </div>

        {webhookInfo && (
          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
            <h5 className="font-medium text-sm">Детали Webhook:</h5>
            <div className="text-xs space-y-1">
              <div><strong>URL:</strong> {webhookInfo.url || 'Не установлен'}</div>
              <div><strong>Ожидающих обновлений:</strong> {webhookInfo.pending_update_count}</div>
              {webhookInfo.last_error_message && (
                <div className="text-red-600">
                  <strong>Последняя ошибка:</strong> {webhookInfo.last_error_message}
                </div>
              )}
              <div><strong>Разрешенные обновления:</strong> {webhookInfo.allowed_updates?.join(', ') || 'Все'}</div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleSetupWebhook}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {webhookStatus?.isCorrect ? 'Переустановить Webhook' : 'Установить Webhook'}
          </Button>
          
          {webhookInfo && (
            <Button 
              variant="outline"
              onClick={handleDeleteWebhook}
              disabled={isLoading}
            >
              Удалить Webhook
            </Button>
          )}
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <h5 className="font-medium text-blue-900 mb-2">💡 Как это работает:</h5>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Webhook позволяет Telegram отправлять сообщения боту в реальном времени</li>
            <li>• Без настроенного webhook бот не будет получать сообщения от пользователей</li>
            <li>• После установки webhook попробуйте подключиться к боту снова</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
