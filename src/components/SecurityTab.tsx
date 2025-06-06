
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const SecurityTab = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveSecuritySettings = async () => {
    setIsLoading(true);
    try {
      // Здесь будет логика сохранения настроек безопасности
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация API запроса
      
      toast({
        title: "Успешно!",
        description: "Настройки безопасности сохранены.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить настройки безопасности.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-graphite">
          <Shield className="h-5 w-5" />
          Безопасность и доступ
        </CardTitle>
        <CardDescription>
          Настройки безопасности и политики доступа
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-graphite">Политики паролей</h4>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="password-complexity" className="text-sm font-semibold text-graphite">
                Сложные пароли
              </Label>
              <Switch id="password-complexity" defaultChecked />
            </div>
            
            <div>
              <Label htmlFor="password-length" className="text-sm font-semibold text-graphite mb-2 block">
                Минимальная длина пароля
              </Label>
              <Select defaultValue="8">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 символов</SelectItem>
                  <SelectItem value="8">8 символов</SelectItem>
                  <SelectItem value="12">12 символов</SelectItem>
                  <SelectItem value="16">16 символов</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="session-timeout" className="text-sm font-semibold text-graphite mb-2 block">
                Время сессии (часы)
              </Label>
              <Select defaultValue="8">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 час</SelectItem>
                  <SelectItem value="4">4 часа</SelectItem>
                  <SelectItem value="8">8 часов</SelectItem>
                  <SelectItem value="24">24 часа</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-graphite">Аудит и логирование</h4>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="audit-log" className="text-sm font-semibold text-graphite">
                Журнал аудита
              </Label>
              <Switch id="audit-log" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="failed-login" className="text-sm font-semibold text-graphite">
                Логировать неудачные входы
              </Label>
              <Switch id="failed-login" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="data-access" className="text-sm font-semibold text-graphite">
                Логировать доступ к данным
              </Label>
              <Switch id="data-access" defaultChecked />
            </div>

            <Button variant="outline" className="w-full">
              Экспорт журнала аудита
            </Button>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-graphite">Двухфакторная аутентификация</h4>
              <p className="text-sm text-gray-500">
                Требовать 2FA для всех пользователей
              </p>
            </div>
            <Switch id="two-factor" />
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <Button 
            className="w-full bg-primary hover:bg-primary/90"
            onClick={handleSaveSecuritySettings}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Сохранить настройки безопасности
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
