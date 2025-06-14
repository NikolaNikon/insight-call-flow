
import React from "react";
import {
  BarChart3,
  BookOpen,
  FileBarChart,
  ListChecks,
  Phone,
  Search,
  Settings,
  Activity,
  Upload,
  Users,
  ChevronLeft,
  ChevronRight,
  User
} from "lucide-react";
import { SidebarLink } from "./SidebarLink";

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ 
  isOpen, 
  onClose, 
  collapsed = false,
  onToggleCollapse 
}) => {
  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-full flex-col border-r bg-background transition-all duration-300 ease-in-out
        lg:relative lg:translate-x-0 
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} 
        ${collapsed ? "lg:w-16" : "lg:w-72"} 
        w-72`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {!collapsed && <span className="font-bold text-2xl">CallControl</span>}
        
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none hover:bg-secondary h-10 w-10 p-0 lg:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
          <span className="sr-only">Close sidebar</span>
        </button>

        {/* Desktop collapse button */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none hover:bg-secondary h-8 w-8 p-0"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      <div className="flex-1 px-3 py-2">
        <nav className="space-y-1">
          <SidebarLink
            to="/"
            icon={<BarChart3 className="h-4 w-4" />}
            text="Дашборд"
            collapsed={collapsed}
            onClick={onClose}
          />
          <SidebarLink
            to="/calls"
            icon={<Phone className="h-4 w-4" />}
            text="Звонки"
            collapsed={collapsed}
            onClick={onClose}
          />
          <SidebarLink
            to="/keyword-trackers"
            icon={<Search className="h-4 w-4" />}
            text="Ключевые слова"
            collapsed={collapsed}
            onClick={onClose}
          />
          <SidebarLink
            to="/analytics"
            icon={<FileBarChart className="h-4 w-4" />}
            text="Аналитика"
            collapsed={collapsed}
            onClick={onClose}
          />
          <SidebarLink
            to="/knowledge-base"
            icon={<BookOpen className="h-4 w-4" />}
            text="База знаний"
            collapsed={collapsed}
            onClick={onClose}
          />
          <SidebarLink
            to="/search"
            icon={<Search className="h-4 w-4" />}
            text="Поиск"
            collapsed={collapsed}
            onClick={onClose}
          />
          <SidebarLink
            to="/monitoring"
            icon={<Activity className="h-4 w-4" />}
            text="Мониторинг"
            collapsed={collapsed}
            onClick={onClose}
          />
          <SidebarLink
            to="/upload"
            icon={<Upload className="h-4 w-4" />}
            text="Загрузка"
            collapsed={collapsed}
            onClick={onClose}
          />
          <SidebarLink
            to="/users"
            icon={<Users className="h-4 w-4" />}
            text="Пользователи"
            collapsed={collapsed}
            onClick={onClose}
          />
          <SidebarLink
            to="/settings"
            icon={<Settings className="h-4 w-4" />}
            text="Настройки"
            collapsed={collapsed}
            onClick={onClose}
          />
          <SidebarLink
            to="/profile"
            icon={<User className="h-5 w-5" />}
            text="Личный кабинет"
            collapsed={collapsed}
            onClick={onClose}
          />
        </nav>
      </div>

      {!collapsed && (
        <div className="border-t p-4">
          <p className="text-sm text-muted-foreground">
            CallControl © {new Date().getFullYear()}
          </p>
        </div>
      )}
    </aside>
  );
};
