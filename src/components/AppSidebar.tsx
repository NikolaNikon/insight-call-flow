
import { Calendar, BarChart3, Search, FileText, Settings, LayoutDashboard } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

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
    title: "Аналитика",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Отчёты",
    url: "/reports",
    icon: FileText,
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
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green border-green/20">
            <div className="w-2 h-2 bg-green rounded-full mr-2"></div>
            Система активна
          </Badge>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
