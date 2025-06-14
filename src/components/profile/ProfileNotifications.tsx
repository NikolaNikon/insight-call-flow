
import React from "react";
import { useUserNotifications } from "@/hooks/useUserNotifications";
import { Switch } from "@/components/ui/switch";

const ProfileNotifications: React.FC = () => {
  const {
    notifications,
    updateNotifications,
    loading
  } = useUserNotifications();
  return (
    <div>
      <div className="mb-2 font-semibold">События:</div>
      <div className="flex gap-4 mb-3">
        <label className="flex items-center gap-2">
          <Switch
            checked={notifications?.notify_calls || false}
            onCheckedChange={(v) =>
              updateNotifications({ notify_calls: v })
            }
            disabled={loading}
          />
          Звонки
        </label>
        <label className="flex items-center gap-2">
          <Switch
            checked={notifications?.notify_risks || false}
            onCheckedChange={(v) =>
              updateNotifications({ notify_risks: v })
            }
            disabled={loading}
          />
          Риски
        </label>
        <label className="flex items-center gap-2">
          <Switch
            checked={notifications?.notify_metrics || false}
            onCheckedChange={(v) =>
              updateNotifications({ notify_metrics: v })
            }
            disabled={loading}
          />
          NSM
        </label>
      </div>
      <div className="mb-2 font-semibold">Канал:</div>
      <div>
        <select
          value={notifications?.channel || "telegram"}
          onChange={(e) =>
            updateNotifications({ channel: e.target.value })
          }
          disabled={loading}
          className="border px-2 py-1 rounded"
        >
          <option value="telegram">Telegram</option>
          <option value="email">Email</option>
        </select>
      </div>
    </div>
  );
};

export default ProfileNotifications;
