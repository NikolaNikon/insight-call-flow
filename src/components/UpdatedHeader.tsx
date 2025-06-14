
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { NotificationCenter } from './NotificationCenter';
import { SidebarTrigger } from '@/components/ui/sidebar';

const UpdatedHeader = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Выход выполнен',
        description: 'Вы успешно вышли из системы.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось выйти из системы.',
      });
    }
  };

  return (
    <header className="bg-card border-b px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-xl font-bold text-foreground">CallControl</h1>
            <p className="text-sm text-muted-foreground">Система контроля и аналитики звонков</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <NotificationCenter />
          
          {user && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Выйти
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default UpdatedHeader;
