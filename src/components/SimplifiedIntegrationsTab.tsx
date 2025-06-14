
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Bot, Phone, Settings, ChevronDown, Building2 } from 'lucide-react';
import { ImprovedTelegramIntegration } from '@/components/ImprovedTelegramIntegration';
import { TelfinOAuthSettings } from '@/components/TelfinOAuthSettings';
import { useUserRole } from '@/hooks/useUserRole';
import { useOrganization } from '@/hooks/useOrganization';

export const SimplifiedIntegrationsTab = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { isAdmin } = useUserRole();
  const { organization } = useOrganization();

  return (
    <div className="space-y-6">
      {/* Organization Info */}
      {organization && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Building2 className="h-5 w-5" />
              Организация: {organization.name}
            </CardTitle>
            <CardDescription className="text-blue-700">
              Все интеграции настраиваются на уровне организации
              {organization.subdomain && ` • Субдомен: ${organization.subdomain}`}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* User Telegram Connection */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-graphite">
            <Bot className="h-5 w-5 text-blue-600" />
            Подключение к Telegram
          </CardTitle>
          <CardDescription>
            Подключите свой личный аккаунт Telegram для получения уведомлений
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImprovedTelegramIntegration />
        </CardContent>
      </Card>

      {/* Telfin Integration */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-graphite">
            <Phone className="h-5 w-5 text-green-600" />
            Интеграция с Телфин (OAuth 2.0)
          </CardTitle>
          <CardDescription>
            Настройка безопасного подключения к телефонии Телфин для получения аудиозаписей
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TelfinOAuthSettings />
        </CardContent>
      </Card>

      {/* Advanced Settings for Admins */}
      {isAdmin && (
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Расширенные настройки
              <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800 text-base">Режим разработчика</CardTitle>
                <CardDescription className="text-orange-700">
                  Дополнительные настройки для администраторов и разработчиков
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-orange-700">
                  <p>• Webhook управление</p>
                  <p>• Отладочная информация</p>
                  <p>• API настройки</p>
                  <p>• Управление организацией</p>
                  <p>• Multi-tenant конфигурация</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    window.location.href = '/settings?mode=advanced';
                  }}
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  Открыть расширенные настройки
                </Button>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};
