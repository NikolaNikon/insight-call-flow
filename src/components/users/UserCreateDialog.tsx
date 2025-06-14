
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";
import { UserForm } from "@/hooks/useUsers";

interface Props {
  disabled?: boolean;
  isOpen: boolean;
  setOpen: (value: boolean) => void;
  onCreate: (formData: UserForm) => Promise<boolean>;
}

export function UserCreateDialog({ isOpen, setOpen, onCreate, disabled }: Props) {
  const [formData, setFormData] = useState<UserForm>({ name: "", email: "", password: "", role: "viewer" });
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    const ok = await onCreate(formData);
    setCreating(false);
    if (ok) {
      setFormData({ name: "", email: "", password: "", role: "viewer" });
      setOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" disabled={disabled}>
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
              onChange={e => setFormData(v => ({ ...v, name: e.target.value }))}
              disabled={creating}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={e => setFormData(v => ({ ...v, email: e.target.value }))}
              disabled={creating}
            />
          </div>
          <div>
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              placeholder="Минимум 6 символов"
              value={formData.password}
              onChange={e => setFormData(v => ({ ...v, password: e.target.value }))}
              disabled={creating}
            />
          </div>
          <div>
            <Label htmlFor="role">Роль</Label>
            <Select
              value={formData.role}
              onValueChange={value =>
                setFormData(v => ({ ...v, role: value }))
              }
              disabled={creating}
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
            <Button onClick={handleCreate} disabled={creating} className="flex-1">
              {creating ? (
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
              onClick={() => setOpen(false)}
              disabled={creating}
            >
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
