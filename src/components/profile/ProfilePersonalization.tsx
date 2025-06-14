
import React from "react";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useTheme } from "../ThemeProvider";

const ProfilePersonalization = () => {
  const { prefs, updatePreferences, loading, nsmMetrics } = useUserPreferences();
  const { setTheme } = useTheme();

  const handleThemeChange = (value: string) => {
    if (value === "light" || value === "dark") {
      updatePreferences({ theme: value });
      setTheme(value);
    }
  };

  return (
    <div className="space-y-4 max-w-md">
      <div>
        <Label htmlFor="language-select">Язык интерфейса:</Label>
        <Select
          value={prefs?.locale || "ru"}
          onValueChange={(value) => updatePreferences({ locale: value })}
          disabled={loading}
        >
          <SelectTrigger id="language-select" className="mt-1">
            <SelectValue placeholder="Выберите язык" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ru">Русский</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="theme-select">Тема:</Label>
        <Select
          value={prefs?.theme === 'dark' ? 'dark' : 'light'}
          onValueChange={handleThemeChange}
          disabled={loading}
        >
          <SelectTrigger id="theme-select" className="mt-1">
            <SelectValue placeholder="Выберите тему" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Светлая</SelectItem>
            <SelectItem value="dark">Тёмная</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="nsm-select">Моя метрика недели (NSM):</Label>
        <Select
          value={prefs?.preferred_nsm || ""}
          onValueChange={(value) => updatePreferences({ preferred_nsm: value })}
          disabled={loading}
        >
          <SelectTrigger id="nsm-select" className="mt-1">
            <SelectValue placeholder="— Не выбрано —" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">— Не выбрано —</SelectItem>
            {nsmMetrics.map((m) => (
              <option key={m.id} value={m.id}>
                {m.metric_name}
              </option>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ProfilePersonalization;
