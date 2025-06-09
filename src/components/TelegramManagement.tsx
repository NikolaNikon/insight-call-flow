
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Trash2, Plus, ExternalLink } from 'lucide-react';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { useToast } from '@/hooks/use-toast';

interface TelegramLink {
  id: string;
  chat_id: number;
  telegram_username?: string;
  first_name?: string;
  created_at: string;
  active: boolean;
}

export const TelegramManagement = () => {
  const [links, setLinks] = useState<TelegramLink[]>([]);
  const [loading, setLoading] = useState(true);
  const { getTelegramLinks, deactivateTelegramLink } = useTelegramAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadTelegramLinks();
  }, []);

  const loadTelegramLinks = async () => {
    setLoading(true);
    try {
      const data = await getTelegramLinks();
      setLinks(data);
    } catch (error) {
      console.error('Error loading telegram links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (linkId: string) => {
    const success = await deactivateTelegramLink(linkId);
    if (success) {
      await loadTelegramLinks();
    }
  };

  const handleConnectBot = () => {
    toast({
      title: "Подключение бота",
      description: "Найдите @callcontrol_tgbot в Telegram и отправьте команду /start",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Telegram уведомления
        </CardTitle>
        <CardDescription>
          Управление подключениями к Telegram боту для получения уведомлений
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-pulse text-gray-500">Загрузка...</div>
          </div>
        ) : links.length === 0 ? (
          <div className="text-center py-6 space-y-4">
            <div className="text-gray-500">
              У вас нет подключенных Telegram аккаунтов
            </div>
            <Button onClick={handleConnectBot} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Подключить Telegram бот
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {links.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Bot className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium">
                      {link.first_name || 'Telegram User'}
                      {link.telegram_username && (
                        <span className="text-gray-500 ml-2">
                          @{link.telegram_username}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Подключен {new Date(link.created_at).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={link.active ? "default" : "secondary"}>
                    {link.active ? "Активен" : "Отключен"}
                  </Badge>
                  {link.active && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeactivate(link.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button 
              onClick={handleConnectBot} 
              variant="outline" 
              className="w-full flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Подключить еще один аккаунт
            </Button>
          </div>
        )}

        <div className="border-t pt-4 space-y-3">
          <h4 className="font-medium">Инструкция по подключению:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
            <li>Найдите бота @callcontrol_tgbot в Telegram</li>
            <li>Отправьте команду /start</li>
            <li>Нажмите кнопку "Подключить аккаунт"</li>
            <li>Авторизуйтесь на сайте, если потребуется</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
