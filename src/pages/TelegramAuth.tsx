
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, Bot } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';

const TelegramAuth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { linkTelegramAccount, isLoading } = useTelegramAuth();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const code = searchParams.get('code');

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Перенаправляем на страницу авторизации с возвратом сюда
      const returnUrl = `/telegram-auth?code=${code}`;
      navigate(`/auth?redirect=${encodeURIComponent(returnUrl)}`);
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('Отсутствует код авторизации');
      return;
    }

    // Извлекаем данные Telegram из URL (если переданы)
    const chat_id = searchParams.get('chat_id');
    const telegram_username = searchParams.get('username');
    const first_name = searchParams.get('first_name');

    if (chat_id) {
      // Если есть данные Telegram, сразу пытаемся связать
      handleTelegramLink({
        code,
        chat_id: parseInt(chat_id),
        telegram_username: telegram_username || undefined,
        first_name: first_name || undefined
      });
    } else {
      // Если данных нет, показываем форму подтверждения
      setStatus('success');
      setMessage('Подтвердите подключение Telegram аккаунта');
    }
  }, [user, authLoading, code]);

  const handleTelegramLink = async (authData: any) => {
    setStatus('loading');
    
    const result = await linkTelegramAccount(authData);
    
    if (result.success) {
      setStatus('success');
      setMessage(result.message || 'Аккаунт успешно подключен!');
    } else {
      setStatus('error');
      setMessage(result.error || 'Произошла ошибка при подключении');
    }
  };

  const handleManualLink = async () => {
    if (!code) return;
    
    // Для ручного подключения используем фиктивные данные
    // В реальности эти данные должны приходить от Telegram бота
    await handleTelegramLink({
      code,
      chat_id: Date.now(), // Временное решение
      telegram_username: 'manual_user',
      first_name: 'User'
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Bot className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Подключение Telegram</CardTitle>
          <CardDescription>
            Связывание вашего аккаунта с Telegram ботом
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === 'loading' && (
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-600">
                {isLoading ? 'Подключаем аккаунт...' : 'Проверяем авторизацию...'}
              </p>
            </div>
          )}

          {status === 'success' && !isLoading && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-8 w-8 mx-auto text-green-600" />
              <div className="space-y-2">
                <h3 className="font-semibold text-green-800">Успешно!</h3>
                <p className="text-gray-600">{message}</p>
              </div>
              <div className="space-y-2 text-sm text-gray-500">
                <p>Теперь вы будете получать:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Уведомления о новых звонках</li>
                  <li>Еженедельные отчеты</li>
                  <li>Важные системные сообщения</li>
                </ul>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-4">
              <XCircle className="h-8 w-8 mx-auto text-red-600" />
              <div className="space-y-2">
                <h3 className="font-semibold text-red-800">Ошибка</h3>
                <p className="text-gray-600">{message}</p>
              </div>
              {code && (
                <Button 
                  onClick={handleManualLink}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Попробовать снова
                </Button>
              )}
            </div>
          )}

          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="w-full"
            >
              Вернуться на главную
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TelegramAuth;
