
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Edit, Trash2, Building2 } from 'lucide-react';
import { CreateUserDialog } from '@/components/CreateUserDialog';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';

export const UserManagementTab = () => {
  const { toast } = useToast();
  const { organization } = useOrganization();
  
  // Загружаем пользователей текущей организации
  const { data: users = [], refetch: refetchUsers } = useQuery({
    queryKey: ['users', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];

      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          organizations!inner(
            name,
            subdomain
          )
        `)
        .eq('org_id', organization.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'operator': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'superadmin': return 'Суперадминистратор';
      case 'admin': return 'Администратор';
      case 'manager': return 'Менеджер';
      case 'operator': return 'Оператор';
      case 'viewer': return 'Наблюдатель';
      default: return 'Пользователь';
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Успешно!",
        description: "Пользователь удален.",
      });
      
      refetchUsers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось удалить пользователя.",
      });
    }
  };

  if (!organization) {
    return (
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-600">Организация не найдена</CardTitle>
          <CardDescription>
            Необходимо настроить организацию для управления пользователями
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-graphite">
              <Users className="h-5 w-5" />
              Управление пользователями
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Building2 className="h-4 w-4 text-blue-600" />
              Организация: {organization.name}
              {organization.subdomain && (
                <Badge variant="outline" className="text-xs">
                  {organization.subdomain}
                </Badge>
              )}
            </CardDescription>
          </div>
          <CreateUserDialog onUserCreated={refetchUsers} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>В организации пока нет пользователей</p>
              <p className="text-sm">Добавьте первого пользователя, нажав кнопку выше</p>
            </div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-graphite">{user.name}</span>
                    <Badge className={getRoleColor(user.role)}>
                      {getRoleText(user.role)}
                    </Badge>
                    <Badge className="bg-green-100 text-green-800">
                      Активный
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-x-4">
                    <span>{user.email}</span>
                    <span>Создан: {new Date(user.created_at).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-2">
                    <Edit className="h-3 w-3" />
                    Редактировать
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-2 text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                    Удалить
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
