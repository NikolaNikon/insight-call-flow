
import React from "react";
import { useUserPreferences } from "@/hooks/useUserPreferences";

const ProfilePersonalization = () => {
  const { prefs, updatePreferences, loading, nsmMetrics } = useUserPreferences();

  return (
    <div className="space-y-4 max-w-md">
      <div>
        <label className="font-medium">Язык интерфейса:</label>
        <select
          className="w-full border px-2 py-1 rounded mt-1"
          value={prefs?.locale || "ru"}
          onChange={(e) =>
            updatePreferences({ locale: e.target.value })
          }
          disabled={loading}
        >
          <option value="ru">Русский</option>
          <option value="en">English</option>
        </select>
      </div>
      <div>
        <label className="font-medium">Тема:</label>
        <select
          className="w-full border px-2 py-1 rounded mt-1"
          value={prefs?.theme || "light"}
          onChange={(e) =>
            updatePreferences({ theme: e.target.value })
          }
          disabled={loading}
        >
          <option value="light">Светлая</option>
          <option value="dark">Тёмная</option>
        </select>
      </div>
      <div>
        <label className="font-medium">Моя метрика недели (NSM):</label>
        <select
          className="w-full border px-2 py-1 rounded mt-1"
          value={prefs?.preferred_nsm || ""}
          onChange={(e) =>
            updatePreferences({ preferred_nsm: e.target.value })
          }
          disabled={loading}
        >
          <option value="">— Не выбрано —</option>
          {nsmMetrics.map((m) => (
            <option key={m.id} value={m.id}>
              {m.metric_name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ProfilePersonalization;
