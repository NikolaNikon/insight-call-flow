
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dashboard2 } from "@/components/dashboard/Dashboard2";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";
import { ArrowRight } from "lucide-react";
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
      {/* Компактное сообщение о настройке (если что-то не настроено) */}
      {!allConfigured && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>🔧</span>
                <span className="text-sm text-amber-800">
                  Не всё подключено. Вы можете закончить настройку в любое время.
                </span>
              </div>
              <Button 
                onClick={handleContinueSetup} 
                variant="outline"
                size="sm"
                className="text-amber-700 border-amber-300 hover:bg-amber-100"
              >
                Продолжить настройку
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Основной контент - Dashboard 2.0 */}
      <Dashboard2 />
    </div>
  );
};

export default Index;
