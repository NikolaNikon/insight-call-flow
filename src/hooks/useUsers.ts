
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin?: string;
}

export type UserForm = {
  name: string;
  email: string;
  password: string;
  role: string;
};

export function useUsers() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      const mappedUsers: UserItem[] = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        status: row.is_active === false ? "inactive" : "active",
        lastLogin: undefined,
      }));
      setUsers(mappedUsers);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось загрузить пользователей",
      });
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (formData: UserForm) => {
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        variant: "destructive",
        title: "Ошибка валидации",
        description: "Все поля обязательны для заполнения"
      });
      return false;
    }
    if (formData.password.length < 6) {
      toast({
        variant: "destructive",
        title: "Ошибка валидации",
        description: "Пароль должен содержать минимум 6 символов"
      });
      return false;
    }
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { name: formData.name, role: formData.role }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        toast({
          title: "Пользователь создан",
          description: `Пользователь ${formData.name} успешно создан`
        });
        await fetchUsers();
        return true;
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка создания пользователя",
        description: error.message || "Не удалось создать пользователя"
      });
      return false;
    } finally {
      setLoading(false);
    }
    return false;
  };

  return { users, loading, fetchUsers, createUser };
}
