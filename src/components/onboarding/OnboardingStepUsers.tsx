
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Plus, Users, Mail, Shield, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OnboardingStepUsersProps {
  onComplete: () => void;
  isCompleted: boolean;
}

interface User {
  id: string;
  email: string;
  role: string;
  name: string;
}

export const OnboardingStepUsers = ({ onComplete, isCompleted }: OnboardingStepUsersProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    role: 'viewer'
  });
  
  const { toast } = useToast();

  const roles = [
    { value: 'superadmin', label: 'Суперадминистратор', description: 'Полный системный доступ' },
    { value: 'admin', label: 'Администратор', description: 'Полный доступ к системе' },
    { value: 'manager', label: 'Менеджер', description: 'Просмотр данных команды' },
    { value: 'operator', label: 'Оператор', description: 'Доступ к своим звонкам' },
    { value: 'viewer', label: 'Наблюдатель', description: 'Только просмотр отчётов' }
  ];

  const handleAddUser = () => {
    if (!newUser.email || !newUser.name) {
      toast({
        title: "Заполните все поля",
        description: "Email и имя обязательны для создания пользователя",
        variant: "destructive"
      });
      return;
    }

    if (users.find(u => u.email === newUser.email)) {
      toast({
        title: "Пользователь уже существует",
        description: "Пользователь с таким email уже добавлен",
        variant: "destructive"
      });
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      ...newUser
    };

    setUsers([...users, user]);
    setNewUser({ email: '', name: '', role: 'viewer' });

    toast({
      title: "Пользователь добавлен",
      description: `${user.name} будет приглашён на ${user.email}`,
    });
  };

  const handleRemoveUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
  };

  const handleFinishStep = () => {
    // Сохраняем пользователей в localStorage для демо
    localStorage.setItem('onboarding_users', JSON.stringify(users));
    onComplete();
    
    toast({
      title: "Команда настроена",
      description: `Добавлено ${users.length} пользователей. Приглашения будут отправлены.`,
    });
  };

  const getRoleBadge = (role: string) => {
    const roleInfo = roles.find(r => r.value === role);
    const colors = {
      superadmin: 'bg-purple-100 text-purple-700',
      admin: 'bg-red-100 text-red-700',
      manager: 'bg-blue-100 text-blue-700',
      operator: 'bg-green-100 text-green-700',
      viewer: 'bg-gray-100 text-gray-700'
    };
    
    return (
      <Badge className={colors[role as keyof typeof colors] || colors.viewer}>
        {roleInfo?.label || role}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium">Добавление пользователей</h3>
          <p className="text-sm text-gray-600">
            Пригласите команду и настройте роли доступа
          </p>
        </div>
        <Badge className="bg-blue-100 text-blue-700">
          <Users className="h-4 w-4 mr-1" />
          {users.length} пользователей
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Добавить пользователя</CardTitle>
            <CardDescription>
              Заполните данные для приглашения
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="user-name">Имя</Label>
              <Input
                id="user-name"
                placeholder="Иван Петров"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                placeholder="ivan@company.com"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="user-role">Роль</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div>
                        <div className="font-medium">{role.label}</div>
                        <div className="text-xs text-gray-500">{role.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleAddUser} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Добавить пользователя
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Добавленные пользователи</CardTitle>
            <CardDescription>
              {users.length === 0 ? 'Пользователи не добавлены' : `${users.length} пользователей готовы к приглашению`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Добавьте первого пользователя</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{user.name}</span>
                        {getRoleBadge(user.role)}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="bg-amber-50 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className="text-amber-600 mt-1 h-5 w-5" />
          <div className="text-sm">
            <p className="font-medium text-amber-900 mb-2">Роли и права доступа:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {roles.map((role) => (
                <div key={role.value} className="flex items-center gap-2">
                  {getRoleBadge(role.value)}
                  <span className="text-amber-700 text-xs">{role.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <Button 
          onClick={handleFinishStep}
          size="lg"
          className="min-w-48"
        >
          <CheckCircle className="mr-2 h-5 w-5" />
          {users.length > 0 ? `Пригласить ${users.length} пользователей` : 'Пропустить этот шаг'}
        </Button>
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>💡 Вы сможете добавить пользователей позже в разделе "Пользователи"</p>
      </div>
    </div>
  );
};
