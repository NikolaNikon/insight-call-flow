
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Users as UsersIcon } from "lucide-react";
import { UserItem } from "@/hooks/useUsers";

function getRoleColor(role: string) {
  switch (role) {
    case "superadmin": return "bg-purple-100 text-purple-800";
    case "admin": return "bg-red-100 text-red-800";
    case "manager": return "bg-blue-100 text-blue-800";
    case "analyst": return "bg-green-100 text-green-800";
    case "viewer": return "bg-gray-100 text-gray-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

function getRoleText(role: string) {
  switch (role) {
    case "superadmin": return "Суперадмин";
    case "admin": return "Администратор";
    case "manager": return "Менеджер";
    case "analyst": return "Аналитик";
    case "viewer": return "Просмотр";
    default: return "Пользователь";
  }
}

function getStatusColor(status: string) {
  return status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
}

interface Props {
  users: UserItem[];
  loading: boolean;
}

export function UserList({ users, loading }: Props) {
  if (loading) {
    return (
      <div className="text-center text-gray-400 py-12">
        <UsersIcon className="mx-auto mb-2 h-5 w-5 animate-spin" />
        Загрузка пользователей...
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <UsersIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>В организации пока нет пользователей</p>
        <p className="text-sm">Добавьте первого пользователя, нажав кнопку выше</p>
      </div>
    );
  }

  return (
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
                {user.status === "active" ? "Активный" : "Неактивный"}
              </Badge>
            </div>
            <div className="text-sm text-gray-600 space-x-4">
              <span>{user.email}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-2" disabled>
              <Edit className="h-3 w-3" />
              Редактировать
            </Button>
            <Button size="sm" variant="outline" className="gap-2 text-red-600 hover:text-red-700" disabled>
              <Trash2 className="h-3 w-3" />
              Удалить
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
