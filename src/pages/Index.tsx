
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  Users, 
  TrendingUp, 
  Clock, 
  Search,
  BarChart3,
  FileText,
  Settings,
  HeartHandshake,
  Star
} from "lucide-react";
import { CallsChart } from "@/components/CallsChart";
import { PerformanceMetrics } from "@/components/PerformanceMetrics";
import { RecentCalls } from "@/components/RecentCalls";

const Index = () => {
  const navigate = useNavigate();

  const quickStats = [
    {
      title: "Всего звонков",
      value: "1,247",
      change: "+12%",
      changeType: "positive" as const,
      icon: Phone,
      color: "bg-blue-500"
    },
    {
      title: "Активных менеджеров",
      value: "24",
      change: "+2",
      changeType: "positive" as const,
      icon: Users,
      color: "bg-green-500"
    },
    {
      title: "Время обработки",
      value: "6.2 мин",
      change: "-8%",
      changeType: "positive" as const,
      icon: Clock,
      color: "bg-orange-500"
    },
    {
      title: "Удовлетворенность",
      value: "87%",
      change: "+5%",
      changeType: "positive" as const,
      icon: HeartHandshake,
      color: "bg-purple-500"
    }
  ];

  const quickActions = [
    {
      title: "Поиск звонков",
      description: "Найти записи по ключевым словам, имени или номеру",
      icon: Search,
      action: () => navigate("/search"),
      color: "bg-blue-50 hover:bg-blue-100"
    },
    {
      title: "Аналитика",
      description: "Просмотр детальной аналитики и дашбордов",
      icon: BarChart3,
      action: () => navigate("/analytics"),
      color: "bg-green-50 hover:bg-green-100"
    },
    {
      title: "Отчеты",
      description: "Создание и просмотр отчетов по менеджерам",
      icon: FileText,
      action: () => navigate("/reports"),
      color: "bg-orange-50 hover:bg-orange-100"
    },
    {
      title: "Настройки",
      description: "Управление пользователями и системой",
      icon: Settings,
      action: () => navigate("/settings"),
      color: "bg-purple-50 hover:bg-purple-100"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">CallControl</h1>
              <p className="text-gray-600">Система контроля и аналитики звонков менеджеров</p>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Система активна
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                      <Icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                    </div>
                    <Badge 
                      variant={stat.changeType === 'positive' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {stat.change}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Быстрые действия
            </CardTitle>
            <CardDescription>
              Основные функции системы для работы с данными звонков
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    className={`h-auto p-4 flex flex-col items-start gap-3 ${action.color} border border-gray-200`}
                    onClick={action.action}
                  >
                    <Icon className="h-6 w-6 text-gray-700" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{action.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{action.description}</p>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Charts and Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CallsChart />
          <PerformanceMetrics />
        </div>

        {/* Recent Calls */}
        <RecentCalls />
      </div>
    </div>
  );
};

export default Index;
