
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TelfinConfigForm } from './telfin/TelfinConfigForm';
import { TelfinStatusDisplay } from './telfin/TelfinStatusDisplay';
import { TelfinCallsList } from './telfin/TelfinCallsList';
import { useTelfin } from '@/hooks/useTelfin';
import { useOrganization } from '@/hooks/useOrganization';
import { useUserRole } from '@/hooks/useUserRole';
import { Loader2 } from 'lucide-react';

export const TelfinOAuthSettings = () => {
  const { organization, isLoading: isLoadingOrg } = useOrganization();
  const { isAdmin, isLoading: isLoadingRole } = useUserRole();
  const telfin = useTelfin();

  if (isLoadingOrg || isLoadingRole) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }
  
  if (!organization) {
    return (
        <div className="text-sm text-center text-gray-500 bg-gray-50 p-4 rounded-lg mt-4">
            Для настройки интеграции необходимо сначала создать или выбрать организацию.
        </div>
    );
  }

  const handleTokenRefresh = () => {
    // Можно добавить дополнительную логику при обновлении токена
    console.log('Token refreshed successfully');
  };

  return (
    <>
      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config">Настройки</TabsTrigger>
          <TabsTrigger value="status">Статус</TabsTrigger>
          <TabsTrigger value="calls">Звонки</TabsTrigger>
        </TabsList>
        
        <TabsContent value="config">
           <TelfinConfigForm 
            config={telfin.config} 
            setConfig={telfin.setConfig} 
            handleSaveConfig={telfin.handleSaveConfig} 
            isAdmin={isAdmin}
          />
        </TabsContent>

        <TabsContent value="status">
          <TelfinStatusDisplay
            isAuthorized={telfin.isAuthorized}
            userInfo={telfin.userInfo}
            isLoading={telfin.isLoading}
            handleConnect={telfin.handleConnect}
            testConnection={telfin.testConnection}
            handleLogout={telfin.handleLogout}
            handleSyncCallHistory={telfin.handleSyncCallHistory}
            isAdmin={isAdmin}
            apiInstance={telfin.apiInstance}
            onTokenRefresh={handleTokenRefresh}
          />
        </TabsContent>

        <TabsContent value="calls">
          <TelfinCallsList />
        </TabsContent>
      </Tabs>

      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg mt-4">
        <strong>Схема Client Credentials:</strong> Для интеграции необходимо создать приложение 
        типа "trusted" в личном кабинете Телфин и указать полученные Application ID и Secret.
        <br /><br />
        <strong>Важно:</strong> Для доступа к данным о звонках (CDR) убедитесь, что уровень доступа 
        приложения установлен на "All" вместо "Call API". Используйте диагностику API для проверки доступности endpoint'ов.
      </div>
    </>
  );
};
