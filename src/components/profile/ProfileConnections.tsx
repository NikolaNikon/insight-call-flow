
import React from "react";
import { useUserTelegram } from "@/hooks/useUserTelegram";
import { Button } from "@/components/ui/button";

const ProfileConnections = () => {
  const { telegram, connecting, disconnectTelegram } = useUserTelegram();

  return (
    <div className="space-y-4">
      <div>
        <div>
          <strong>Telegram: </strong>
          {telegram?.active ? (
            <span className="text-green-700 ml-1">
              ✅ @{telegram.telegram_username}
              <Button size="sm" className="ml-4" variant="outline" onClick={disconnectTelegram} disabled={connecting}>
                Отключить
              </Button>
            </span>
          ) : (
            <span className="text-gray-500 ml-2">🔌 Не подключён</span>
          )}
        </div>
      </div>
      <div>
        <strong>Email-уведомления: </strong>
        <span className="ml-2 text-blue-700">ON/OFF (скоро)</span>
      </div>
    </div>
  );
};

export default ProfileConnections;
