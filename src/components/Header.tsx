
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { user } = useAuth();

  return (
    <div className="bg-card rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">CallControl</h1>
            <p className="text-muted-foreground">Система контроля и аналитики звонков менеджеров</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-theme-green-text border-theme-green-text bg-theme-green-bg">
            <div className="w-2 h-2 bg-theme-green-text rounded-full mr-2"></div>
            Система активна
          </Badge>
          <ThemeToggle />
          {user && <UserMenu />}
        </div>
      </div>
    </div>
  );
};

export default Header;
