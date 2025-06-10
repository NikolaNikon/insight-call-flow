
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface EditUserDialogProps {
  user: User;
  onUserUpdated?: () => void;
}

export const EditUserDialog = ({ user, onUserUpdated }: EditUserDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          email: formData.email,
          role: formData.role
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Успешно!",
        description: "Данные пользователя обновлены.",
      });

      setOpen(false);
      onUserUpdated?.();

    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        variant: "destructive",
        title: "Ошибка обновления",
        description: error.message || "Не удалось обновить данные пользователя",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Edit className="h-3 w-3" />
          Редактировать
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-graphite">Редактировать пользователя</DialogTitle>
          <DialogDescription>
            Измените данные пользователя
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-sm font-semibold text-graphite">
              Имя
            </Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Введите имя"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email" className="text-sm font-semibold text-graphite">
              Email
            </Label>
            <Input
              id="edit-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="user@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-role" className="text-sm font-semibold text-graphite">
              Роль
            </Label>
            <Select 
              value={formData.role} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="superadmin">Суперадминистратор</SelectItem>
                <SelectItem value="admin">Администратор</SelectItem>
                <SelectItem value="manager">Менеджер</SelectItem>
                <SelectItem value="operator">Оператор</SelectItem>
                <SelectItem value="viewer">Наблюдатель</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Сохранить
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
