
import { useAuth } from '@/hooks/useAuth';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
  onMenuClick?: () => void;
}

const pathTitleMap: { [key: string]: string } = {
  '/': 'Дашборд',
  '/calls': 'Звонки',
  '/keyword-trackers': 'Ключевые слова',
  '/analytics': 'Аналитика и отчёты',
  '/knowledge-base': 'База знаний',
  '/search': 'Поиск',
  '/monitoring': 'Мониторинг',
  '/upload': 'Загрузка',
  '/users': 'Пользователи',
  '/settings': 'Настройки',
  '/profile': 'Личный кабинет',
  '/telegram-tracker': 'Telegram Трекер',
};

const getPageTitle = (pathname: string) => {
  const basePath = `/${pathname.split('/')[1]}`;
  if (pathTitleMap[basePath]) {
    return pathTitleMap[basePath];
  }
  // Резервный вариант для динамических маршрутов или не нанесенных на карту путей
  const pageName = basePath.slice(1).replace(/-/g, ' ');
  return pageName.charAt(0).toUpperCase() + pageName.slice(1) || 'Дашборд';
};


const Header = ({ onMenuClick }: HeaderProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="bg-card rounded-lg shadow-sm border p-4 mb-4">
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
          <h1 className="text-3xl font-bold text-foreground">{pageTitle}</h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user && <UserMenu />}
        </div>
      </div>
    </div>
  );
};

export default Header;
