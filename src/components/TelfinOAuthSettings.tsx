
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TelfinConfigForm } from './telfin/TelfinConfigForm';
import { TelfinStatusDisplay } from './telfin/TelfinStatusDisplay';
import { useTelfin } from '@/hooks/useTelfin';
import { useOrganization } from '@/hooks/useOrganization';
import { Loader2 } from 'lucide-react';

export const TelfinOAuthSettings = () => {
  const { organization, isLoading: isLoadingOrg } = useOrganization();
  const telfin = useTelfin();

  if (isLoadingOrg) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }
  
  if (!organization) {
    return (
        <div className="text-sm text-center text-gray-500 bg-gray-50 p-4 rounded-lg mt-4">
            Для настройки интеграции необходимо сначала создать или выбрать организацию.
        </div>
    );
  }

  return (
    <>
      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="config">Настройки</TabsTrigger>
          <TabsTrigger value="status">Статус</TabsTrigger>
        </TabsList>
        
        <TabsContent value="config">
           <TelfinConfigForm 
            config={telfin.config} 
            setConfig={telfin.setConfig} 
            handleSaveConfig={telfin.handleSaveConfig} 
          />
        </TabsContent>

        <TabsContent value="status">
          <TelfinStatusDisplay
            isAuthorized={telfin.isAuthorized}
            userInfo={telfin.userInfo}
            isLoading={telfin.isLoading}
            handleStartOAuth={telfin.handleStartOAuth}
            testConnection={telfin.testConnection}
            handleLogout={telfin.handleLogout}
            handleSyncCallHistory={telfin.handleSyncCallHistory}
          />
        </TabsContent>
      </Tabs>

      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg mt-4">
        <strong>Схема OAuth 2.0:</strong> Для полноценной интеграции необходимо создать OAuth приложение 
        в системе Телфин с указанным выше Redirect URI. После авторизации система автоматически создаст 
        доверенное приложение для постоянного доступа к API.
      </div>
    </>
  );
};
