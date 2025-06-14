
import React from "react";
import { useUserSessions } from "@/hooks/useUserSessions";
import { Button } from "@/components/ui/button";

const ProfileSecurity = () => {
  const { sessions, loading, logoutAll } = useUserSessions();

  return (
    <div className="space-y-6">
      <div>
        <div className="font-semibold mb-2">Активные сессии:</div>
        <ul className="space-y-1">
          {sessions.map((s) => (
            <li key={s.id}>
              <div className="flex gap-3 items-center">
                <span>
                  {new Date(s.created_at).toLocaleString("ru-RU")}
                </span>
                <span className="text-xs text-gray-500">
                  {s.ip_address || "?"}
                </span>
                <span className="text-xs text-gray-500">
                  {s.user_agent?.slice(0, 32)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <Button variant="destructive" size="sm" onClick={logoutAll} disabled={loading}>
          Выйти на всех устройствах
        </Button>
      </div>
    </div>
  );
};

export default ProfileSecurity;
