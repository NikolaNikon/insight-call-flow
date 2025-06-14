
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users as UsersIcon } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { UserCreateDialog } from "@/components/users/UserCreateDialog";
import { UserList } from "@/components/users/UserList";

const Users = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { users, loading, fetchUsers, createUser } = useUsers();

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

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
              <UserCreateDialog isOpen={isCreateDialogOpen} setOpen={setIsCreateDialogOpen} onCreate={createUser} />
            </div>
          </CardHeader>
          <CardContent>
            <UserList users={users} loading={loading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Users;
