
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';

interface TelfinConfigFormProps {
  config: {
    hostname: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
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
          <Label htmlFor="hostname">Hostname Телфин</Label>
          <Input
            id="hostname"
            placeholder="example.telfin.ru"
            value={config.hostname}
            onChange={(e) => setConfig({ ...config, hostname: e.target.value })}
            readOnly={!isAdmin}
          />
        </div>
        
        <div>
          <Label htmlFor="client-id">Client ID (App ID)</Label>
          <Input
            id="client-id"
            placeholder="a80f1e618ddd4d4584e2bd48fd404194"
            value={config.clientId}
            onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
            readOnly={!isAdmin}
          />
        </div>
        
        <div>
          <Label htmlFor="client-secret">Client Secret (App Secret)</Label>
          <Input
            id="client-secret"
            type="password"
            placeholder="a2423941f5be408c998d5f7207570990"
            value={config.clientSecret}
            onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
            readOnly={!isAdmin}
          />
        </div>

        <div>
          <Label htmlFor="redirect-uri">Redirect URI</Label>
          <Input
            id="redirect-uri"
            value={config.redirectUri}
            readOnly
            className="bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">
            Укажите этот URI при создании OAuth приложения в Телфин
          </p>
        </div>
      </div>

      <Button onClick={handleSaveConfig} className="gap-2" disabled={!isAdmin}>
        <Save className="h-4 w-4" />
        Сохранить настройки
      </Button>
    </div>
  );
};
