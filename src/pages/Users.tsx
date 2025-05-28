
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users as UsersIcon, 
  Plus,
  Edit,
  Trash2,
  Loader2
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin?: string;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "Администратор",
      email: "admin@callcontrol.ru",
      role: "admin",
      status: "active",
      lastLogin: "2024-01-22 14:30"
    },
    {
      id: "2",
      name: "Иванов Иван",
      email: "ivanov@callcontrol.ru", 
      role: "manager",
      status: "active",
      lastLogin: "2024-01-22 12:15"
    },
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "viewer"
  });

  const { toast } = useToast();

  const handleCreateUser = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        variant: "destructive",
        title: "Ошибка валидации",
        description: "Все поля обязательны для заполнения"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        variant: "destructive",
        title: "Ошибка валидации",
        description: "Пароль должен содержать минимум 6 символов"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Создаем пользователя через Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: formData.role
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // Добавляем пользователя в локальный список
        const newUser: User = {
          id: authData.user.id,
          name: formData.name,
          email: formData.email,
          role: formData.role,
          status: "active"
        };

        setUsers(prev => [...prev, newUser]);

        toast({
          title: "Пользователь создан",
          description: `Пользователь ${formData.name} успешно создан`
        });

        // Очищаем форму и закрываем диалог
        setFormData({ name: "", email: "", password: "", role: "viewer" });
        setIsCreateDialogOpen(false);
      }
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        variant: "destructive",
        title: "Ошибка создания пользователя",
        description: error.message || "Не удалось создать пользователя"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'analyst': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Администратор';
      case 'manager': return 'Менеджер';
      case 'analyst': return 'Аналитик';
      case 'viewer': return 'Просмотр';
      default: return 'Пользователь';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <UsersIcon className="h-5 w-5" />
                  Управление пользователями
                </CardTitle>
                <CardDescription>
                  Добавление, редактирование и управление доступом пользователей
                </CardDescription>
              </div>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Добавить пользователя
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Создать нового пользователя</DialogTitle>
                    <DialogDescription>
                      Заполните форму для создания нового пользователя системы
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Имя</Label>
                      <Input
                        id="name"
                        placeholder="Введите имя пользователя"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="user@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Пароль</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Минимум 6 символов"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Роль</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Администратор</SelectItem>
                          <SelectItem value="manager">Менеджер</SelectItem>
                          <SelectItem value="analyst">Аналитик</SelectItem>
                          <SelectItem value="viewer">Просмотр</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleCreateUser}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Создание...
                          </>
                        ) : (
                          "Создать пользователя"
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                        disabled={isLoading}
                      >
                        Отмена
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-gray-900">{user.name}</span>
                      <Badge className={getRoleColor(user.role)}>
                        {getRoleText(user.role)}
                      </Badge>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status === 'active' ? 'Активный' : 'Неактивный'}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-x-4">
                      <span>{user.email}</span>
                      {user.lastLogin && (
                        <span>Последний вход: {user.lastLogin}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-2">
                      <Edit className="h-3 w-3" />
                      Редактировать
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2 text-red-600 hover:text-red-700">
                      <Trash2 className="h-3 w-3" />
                      Удалить
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Users;
