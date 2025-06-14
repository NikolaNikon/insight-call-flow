
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const colorTokens = [
  { name: 'Default', textClass: 'text-theme-default-text', bgClass: 'bg-theme-default-bg' },
  { name: 'Gray', textClass: 'text-theme-gray-text', bgClass: 'bg-theme-gray-bg' },
  { name: 'Brown', textClass: 'text-theme-brown-text', bgClass: 'bg-theme-brown-bg' },
  { name: 'Orange', textClass: 'text-theme-orange-text', bgClass: 'bg-theme-orange-bg' },
  { name: 'Yellow', textClass: 'text-theme-yellow-text', bgClass: 'bg-theme-yellow-bg' },
  { name: 'Green', textClass: 'text-theme-green-text', bgClass: 'bg-theme-green-bg' },
  { name: 'Blue', textClass: 'text-theme-blue-text', bgClass: 'bg-theme-blue-bg' },
  { name: 'Purple', textClass: 'text-theme-purple-text', bgClass: 'bg-theme-purple-bg' },
  { name: 'Pink', textClass: 'text-theme-pink-text', bgClass: 'bg-theme-pink-bg' },
  { name: 'Red', textClass: 'text-theme-red-text', bgClass: 'bg-theme-red-bg' },
];

export const ThemePreview = () => {
  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Цветовые токены CallControl</CardTitle>
        <CardDescription>
          Демонстрация всех доступных цветовых токенов в текущей теме
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {colorTokens.map((token) => (
            <div key={token.name} className="space-y-2">
              <div className={`${token.bgClass} p-4 rounded-lg border`}>
                <div className={`${token.textClass} font-medium`}>
                  {token.name}
                </div>
                <div className={`${token.textClass} text-sm opacity-75`}>
                  Текст
                </div>
              </div>
              <Badge className={`${token.textClass} ${token.bgClass} border-current`}>
                Badge {token.name}
              </Badge>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Примеры использования компонентов</h3>
          
          <div className="flex flex-wrap gap-2">
            {colorTokens.slice(0, 5).map((token) => (
              <Button
                key={token.name}
                variant="outline"
                className={`${token.textClass} ${token.bgClass} border-current hover:opacity-80`}
              >
                {token.name} Button
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-foreground">
              Основной текст использует переменную <code className="bg-muted px-1 py-0.5 rounded">--foreground</code>
            </p>
            <p className="text-muted-foreground">
              Второстепенный текст использует <code className="bg-muted px-1 py-0.5 rounded">--muted-foreground</code>
            </p>
            <p className="text-theme-blue-text">
              Ссылки и активные элементы используют <code className="bg-muted px-1 py-0.5 rounded">--text-color-blue</code>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
