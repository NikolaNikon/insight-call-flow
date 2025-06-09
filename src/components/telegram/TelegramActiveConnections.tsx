
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Trash2, RefreshCw } from 'lucide-react';

interface TelegramLink {
  id: string;
  chat_id: number;
  telegram_username?: string;
  first_name?: string;
  created_at: string;
  active: boolean;
}

interface TelegramActiveConnectionsProps {
  links: TelegramLink[];
  onDeactivate: (linkId: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export const TelegramActiveConnections: React.FC<TelegramActiveConnectionsProps> = ({
  links,
  onDeactivate,
  onRefresh,
  loading
}) => {
  if (links.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm text-gray-700">Активные подключения:</h4>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      {links.map((link) => (
        <div
          key={link.id}
          className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200"
        >
          <div className="flex items-center gap-3">
            <Bot className="h-4 w-4 text-green-600" />
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
            <Badge variant={link.active ? "default" : "secondary"} className="bg-green-100 text-green-700">
              {link.active ? "✅ Активен" : "❌ Отключен"}
            </Badge>
            {link.active && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeactivate(link.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
