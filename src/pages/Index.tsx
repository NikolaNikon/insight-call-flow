
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dashboard2 } from "@/components/dashboard/Dashboard2";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Index = () => {
  useRealtimeUpdates();
  const navigate = useNavigate();
  
  const [setupStatus, setSetupStatus] = useState({
    telfin: false,
    telegram: false,
    users: false
  });

  useEffect(() => {
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
    localStorage.removeItem('onboarding_completed');
    window.dispatchEvent(new Event('onboardingCompleted'));
    navigate('/welcome');
  };

  return (
    <div className="space-y-6">
      {!allConfigured && (
        <Card className="border-theme-yellow-text bg-theme-yellow-bg">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>🔧</span>
                <span className="text-sm text-theme-yellow-text">
                  Не всё подключено. Вы можете закончить настройку в любое время.
                </span>
              </div>
              <Button 
                onClick={handleContinueSetup} 
                variant="outline"
                size="sm"
                className="text-theme-yellow-text border-theme-yellow-text hover:bg-theme-yellow-text/10"
              >
                Продолжить настройку
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Dashboard2 />
    </div>
  );
};

export default Index;
