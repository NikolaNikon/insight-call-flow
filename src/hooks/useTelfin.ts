
import { useOrganization } from './useOrganization';
import { useTelfinConnection } from './useTelfinConnection';
import { useTelfinConfig } from './telfin/useTelfinConfig';
import { useTelfinAuth } from './telfin/useTelfinAuth';
import { useTelfinSync } from './telfin/useTelfinSync';

export const useTelfin = () => {
  const { organization } = useOrganization();
  const orgId = organization?.id;

  const {
    isLoadingConnection,
  } = useTelfinConnection(orgId);

  const {
    localConfig,
    setLocalConfig,
    handleSaveConfig,
    connection,
    saveConnectionAsync,
    isSavingConnection,
  } = useTelfinConfig(orgId);

  const {
    isAuthorized,
    userInfo,
    apiInstance,
    isConnecting,
    handleConnect,
    handleLogout,
    testConnection,
  } = useTelfinAuth(connection, localConfig, orgId, saveConnectionAsync);

  const {
    isSyncing,
    handleSyncCallHistory,
  } = useTelfinSync(apiInstance, orgId, userInfo, localConfig);

  return {
    config: localConfig,
    setConfig: setLocalConfig,
    isAuthorized,
    userInfo,
    apiInstance, // Добавляем apiInstance в возвращаемые значения
    isLoading: isLoadingConnection || isSavingConnection || isConnecting || isSyncing,
    handleSaveConfig,
    handleConnect,
    testConnection,
    handleLogout,
    handleSyncCallHistory,
  };
};
