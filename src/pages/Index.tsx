
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PerformanceMetrics } from "@/components/PerformanceMetrics";
import { RecentCalls } from "@/components/RecentCalls";
import { CallsChart } from "@/components/CallsChart";
import { AudioUploader } from "@/components/AudioUploader";
import { ProcessingMonitor } from "@/components/ProcessingMonitor";
import { ExportManager } from "@/components/ExportManager";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Users, HelpCircle, CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Index = () => {
  // Подключаем real-time обновления
  useRealtimeUpdates();
  const navigate = useNavigate();
  
  const [setupStatus, setSetupStatus] = useState({
    telfin: false,
    telegram: false,
    users: false
  });

  useEffect(() => {
    // Проверяем статус настроек
    const telfinConfigured = localStorage.getItem('telfin_hostname') && 
                            localStorage.getItem('telfin_username') && 
                            localStorage.getItem('telfin_password');
    
    const telegramConfigured = localStorage.getItem('telegram_bot_token') && 
                              localStorage.getItem('telegram_chat_id');
    
    const usersConfigured = localStorage.getItem('onboarding_users');

    setSetupStatus({
      telfin: !!telfinConfigured,
      telegram: !!telegramConfigured,
      users: !!usersConfigured
    });
  }, []);

  const allConfigured = setupStatus.telfin && setupStatus.telegram && setupStatus.users;

  const handleContinueSetup = () => {
    // Сбрасываем onboarding и возвращаем на welcome
    localStorage.removeItem('onboarding_completed');
    window.dispatchEvent(new Event('onboardingCompleted'));
    navigate('/welcome');
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              CallControl - Дашборд
            </h1>
            <p className="text-gray-600">
              Система контроля качества телефонных переговоров и анализа эффективности менеджеров
            </p>
          </div>
          {!allConfigured && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              Требуется настройка
            </Badge>
          )}
        </div>
      </div>

      {/* Блок быстрой настройки (если что-то не настроено) */}
      {!allConfigured && (
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Settings className="h-5 w-5" />
              Завершите настройку системы для полноценной работы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                setupStatus.telfin 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-white border-amber-200 border-dashed'
              }`}>
                {setupStatus.telfin ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <div className="w-5 h-5 border-2 border-amber-400 rounded-full" />
                )}
                <div>
                  <p className="font-medium">Телфин API</p>
                  <p className="text-sm text-gray-600">Подключение телефонии</p>
                </div>
              </div>

              <div className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                setupStatus.telegram 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-white border-amber-200 border-dashed'
              }`}>
                {setupStatus.telegram ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <div className="w-5 h-5 border-2 border-amber-400 rounded-full" />
                )}
                <div>
                  <p className="font-medium">Telegram-бот</p>
                  <p className="text-sm text-gray-600">Уведомления</p>
                </div>
              </div>

              <div className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                setupStatus.users 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-white border-amber-200 border-dashed'
              }`}>
                {setupStatus.users ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <div className="w-5 h-5 border-2 border-amber-400 rounded-full" />
                )}
                <div>
                  <p className="font-medium">Пользователи</p>
                  <p className="text-sm text-gray-600">Команда и роли</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={handleContinueSetup} 
                className="bg-amber-600 hover:bg-amber-700 text-white"
                size="lg"
              >
                Продолжить настройку
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button onClick={() => navigate('/settings')} variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Открыть настройки
              </Button>
              <Button onClick={() => navigate('/users')} variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Управление пользователями
              </Button>
              <Button onClick={() => navigate('/knowledge-base')} variant="outline">
                <HelpCircle className="mr-2 h-4 w-4" />
                База знаний
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Основной контент */}
      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">Загрузка</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
          <TabsTrigger value="monitoring">Мониторинг</TabsTrigger>
          <TabsTrigger value="export">Экспорт</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <AudioUploader />
          <ProcessingMonitor />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <PerformanceMetrics />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CallsChart />
            <RecentCalls />
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProcessingMonitor />
            <Card>
              <CardHeader>
                <CardTitle>Статистика обработки</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Всего звонков сегодня:</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">В обработке:</span>
                    <span className="font-medium text-blue-600">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Завершено:</span>
                    <span className="font-medium text-green-600">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ошибки:</span>
                    <span className="font-medium text-red-600">0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <ExportManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
