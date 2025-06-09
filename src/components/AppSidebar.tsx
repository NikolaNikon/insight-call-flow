
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
} from "lucide-react";
import { SidebarLink } from "./SidebarLink";

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ isOpen, onClose }) => {
  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-full w-72.5 flex-col border-r bg-background transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <span className="font-bold text-2xl">CallControl</span>
        <button
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary hover:bg-secondary h-10 w-10 p-0"
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
      </div>

      <div className="flex-1 px-3 py-2">
        <nav className="space-y-1">
          <SidebarLink
            to="/"
            icon={<BarChart3 className="h-4 w-4" />}
            text="Дашборд"
          />
          <SidebarLink
            to="/calls"
            icon={<Phone className="h-4 w-4" />}
            text="Звонки"
          />
          <SidebarLink
            to="/keyword-trackers"
            icon={<Search className="h-4 w-4" />}
            text="Ключевые слова"
          />
          <SidebarLink
            to="/analytics"
            icon={<FileBarChart className="h-4 w-4" />}
            text="Аналитика"
          />
          <SidebarLink
            to="/knowledge-base"
            icon={<BookOpen className="h-4 w-4" />}
            text="База знаний"
          />
          <SidebarLink
            to="/search"
            icon={<Search className="h-4 w-4" />}
            text="Поиск"
          />
          <SidebarLink
            to="/monitoring"
            icon={<Activity className="h-4 w-4" />}
            text="Мониторинг"
          />
          <SidebarLink
            to="/upload"
            icon={<Upload className="h-4 w-4" />}
            text="Загрузка"
          />
          <SidebarLink
            to="/users"
            icon={<Users className="h-4 w-4" />}
            text="Пользователи"
          />
          <SidebarLink
            to="/settings"
            icon={<Settings className="h-4 w-4" />}
            text="Настройки"
          />
        </nav>
      </div>

      <div className="border-t p-4">
        <p className="text-sm text-muted-foreground">
          CallControl © {new Date().getFullYear()}
        </p>
      </div>
    </aside>
  );
};
