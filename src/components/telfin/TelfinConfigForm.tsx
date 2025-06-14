
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';

interface TelfinConfigFormProps {
  config: {
    clientId: string;
    clientSecret: string;
  };
  setConfig: (config: TelfinConfigFormProps['config']) => void;
  handleSaveConfig: () => void;
  isAdmin: boolean;
}

export const TelfinConfigForm: React.FC<TelfinConfigFormProps> = ({ config, setConfig, handleSaveConfig, isAdmin }) => {
  return (
    <div className="space-y-4 pt-4">
      {!isAdmin && (
        <div className="text-sm text-center text-yellow-700 bg-yellow-50 p-3 rounded-lg">
          У вас нет прав на редактирование этих настроек. Обратитесь к администратору.
        </div>
      )}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="client-id">Application ID (client_id)</Label>
          <Input
            id="client-id"
            placeholder="Ваш Application ID из личного кабинета Телфин"
            value={config.clientId}
            onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
            readOnly={!isAdmin}
          />
        </div>
        
        <div>
          <Label htmlFor="client-secret">Application Secret (client_secret)</Label>
          <Input
            id="client-secret"
            type="password"
            placeholder="Ваш Application Secret"
            value={config.clientSecret}
            onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
            readOnly={!isAdmin}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Получить Application ID и Secret можно в личном кабинете Телфин, создав приложение типа "trusted".
        </p>
      </div>

      <Button onClick={handleSaveConfig} className="gap-2" disabled={!isAdmin}>
        <Save className="h-4 w-4" />
        Сохранить настройки
      </Button>
    </div>
  );
};
