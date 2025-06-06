
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Key } from 'lucide-react';
import { TelfinSettings } from '@/components/TelfinSettings';
import { TelfinOAuthSettings } from '@/components/TelfinOAuthSettings';

export const TelfinTab = () => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-graphite">
            <Phone className="h-5 w-5 text-blue-600" />
            Базовая интеграция (HTTP Basic Auth)
          </CardTitle>
          <CardDescription>
            Простая интеграция для получения аудиозаписей через логин и пароль
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TelfinSettings />
        </CardContent>
      </Card>

      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-graphite">
            <Key className="h-5 w-5 text-green-600" />
            OAuth 2.0 интеграция (рекомендуется)
          </CardTitle>
          <CardDescription>
            Полная OAuth 2.0 интеграция для безопасного доступа к API Телфин
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TelfinOAuthSettings />
        </CardContent>
      </Card>
    </div>
  );
};
