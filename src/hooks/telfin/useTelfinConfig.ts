
import { useState, useEffect } from 'react';
import { useToast } from '../use-toast';
import { useTelfinConnection } from '../useTelfinConnection';
import { extractErrorCode } from './telfinErrorUtils';

export const useTelfinConfig = (orgId: string | undefined) => {
  const { toast } = useToast();
  const {
    connection,
    saveConnection,
    saveConnectionAsync,
    isSavingConnection,
  } = useTelfinConnection(orgId);

  const [localConfig, setLocalConfig] = useState({
    clientId: '',
    clientSecret: '',
  });

  useEffect(() => {
    if (connection) {
      const newLocalConfig = {
        clientId: connection.client_id || '',
        clientSecret: connection.client_secret || '',
      };
      setLocalConfig(newLocalConfig);
    } else if (orgId) {
      setLocalConfig({ clientId: '', clientSecret: '' });
    }
  }, [connection, orgId]);

  const handleSaveConfig = () => {
    if (!orgId || !localConfig.clientId || !localConfig.clientSecret) {
      const errorCode = "TELFIN-HOOK-002";
      const errorText = "Заполните Application ID и Application Secret.";
      toast({ 
        title: `Ошибка конфигурации [${errorCode}]`, 
        description: errorText, 
        variant: "destructive",
        copyableText: `Error Code: ${errorCode}\nTitle: Ошибка конфигурации\nDescription: ${errorText}`
      });
      return;
    }
    
    saveConnection({
      org_id: orgId,
      client_id: localConfig.clientId,
      client_secret: localConfig.clientSecret,
      access_token: null,
      refresh_token: null,
      token_expiry: null,
    }, {
      onSuccess: () => {
        toast({ title: "Настройки сохранены", description: "Конфигурация Телфин успешно сохранена" });
      },
      onError: (error: any) => {
        const [errorCode, errorMessage] = extractErrorCode(error.message);
        const finalErrorCode = errorCode || 'TELFIN-HOOK-003';
        toast({ 
          title: `Ошибка сохранения [${finalErrorCode}]`,
          description: errorMessage, 
          variant: "destructive",
          copyableText: `Error Code: ${finalErrorCode}\nTitle: Ошибка сохранения\nDescription: ${errorMessage}\nDetails: ${JSON.stringify(error, null, 2)}`
        });
      }
    });
  };

  return {
    localConfig,
    setLocalConfig,
    handleSaveConfig,
    connection,
    saveConnectionAsync,
    isSavingConnection,
  };
};
