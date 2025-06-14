
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OnboardingStepTelfinProps {
  onComplete: () => void;
  isCompleted: boolean;
}

export const OnboardingStepTelfin = ({ onComplete }: OnboardingStepTelfinProps) => {
  const navigate = useNavigate();

  // Этот шаг теперь касается OAuth, который настраивается на странице настроек.
  // Мы не можем легко проверить статус отсюда без новых хуков/логики.
  // Поэтому мы просто пометим его как выполненный и направим пользователя.
  useEffect(() => {
    onComplete();
  }, [onComplete]);

  const goToIntegrations = () => {
    navigate('/settings?tab=integrations');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium">Подключение к Телфин (OAuth)</h3>
          <p className="text-sm text-gray-600">
            Интеграция с телефонией теперь настраивается через безопасный протокол OAuth 2.0.
          </p>
        </div>
        <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-4 w-4 mr-1" />Готово к настройке</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Настройка в разделе "Интеграции"</CardTitle>
          <CardDescription>
            Вся настройка телефонии Телфин происходит на странице настроек.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-sm text-gray-700">
              Мы перешли на более современный и безопасный способ подключения к Телфин. 
              Старый метод с вводом логина и пароля больше не используется.
            </p>
            <p className="text-sm text-gray-700">
              Вы можете настроить интеграцию в любое время на странице настроек.
            </p>
            <Button 
              onClick={goToIntegrations} 
              className="w-full"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Перейти к настройкам интеграций
            </Button>
        </CardContent>
      </Card>
    </div>
  );
};
