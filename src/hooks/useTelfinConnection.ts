
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTelfinConnection, saveTelfinConnection } from '@/services/telfinService';
import { Database } from '@/integrations/supabase/types';

type UpsertTelfinConnection = Database['public']['Tables']['telfin_connections']['Insert'];
type TelfinConnection = Database['public']['Tables']['telfin_connections']['Row'];

export const useTelfinConnection = (orgId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: connection, isLoading: isLoadingConnection } = useQuery({
    queryKey: ['telfin_connection', orgId],
    queryFn: () => getTelfinConnection(orgId!),
    enabled: !!orgId,
  });

  const { mutate, mutateAsync, isPending: isSavingConnection } = useMutation({
    mutationFn: (connectionData: UpsertTelfinConnection) => saveTelfinConnection(connectionData),
    onSuccess: (data: TelfinConnection | null) => {
      if (data) {
        queryClient.setQueryData(['telfin_connection', orgId], data);
      } else {
        queryClient.invalidateQueries({ queryKey: ['telfin_connection', orgId] });
      }
    },
  });

  return {
    connection,
    isLoadingConnection,
    saveConnection: mutate,
    saveConnectionAsync: mutateAsync,
    isSavingConnection,
  };
};
