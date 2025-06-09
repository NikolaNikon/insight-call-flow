
import { Calendar, BarChart3, Search, FileText, Settings, LayoutDashboard, BookOpen, Upload, Monitor, Download } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Дашборд",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Звонки",
    url: "/calls",
    icon: Search,
  },
  {
    title: "📈 Аналитика и отчёты",
    url: "/analytics-reports",
    icon: BarChart3,
  },
  {
    title: "Загрузка",
    url: "/upload",
    icon: Upload,
  },
  {
    title: "Мониторинг",
    url: "/monitoring",
    icon: Monitor,
  },
  {
    title: "База знаний",
    url: "/knowledge-base",
    icon: BookOpen,
  },
  {
    title: "Настройки",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Calendar className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-graphite">CallControl</h1>
            <p className="text-xs text-muted-foreground">Система аналитики</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        {/* Footer content if needed */}
      </SidebarFooter>
    </Sidebar>
  );
}
