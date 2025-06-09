
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  Users, 
  Bot, 
  Monitor,
  Zap,
  MessageSquare,
  RefreshCw
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  area: 'frontend' | 'backend' | 'bot';
  feature: string;
}

const initialTasks: Task[] = [
  // Real-time UI Update Feature
  {
    id: 'rt-1',
    title: 'Реализовать polling статуса сессии',
    description: 'Добавить опрос /api/telegram/session/status каждые 3-5 секунд',
    status: 'pending',
    priority: 'high',
    area: 'frontend',
    feature: 'Real-time UI Update'
  },
  {
    id: 'rt-2', 
    title: 'Обновить UI при успешном подключении',
    description: 'Скрыть "Ожидание подключения" и показать статус подключения',
    status: 'pending',
    priority: 'high',
    area: 'frontend',
    feature: 'Real-time UI Update'
  },
  {
    id: 'rt-3',
    title: 'Создать endpoint для проверки статуса',
    description: 'GET /api/telegram/session/status?code=... с данными подключения',
    status: 'pending',
    priority: 'high',
    area: 'backend',
    feature: 'Real-time UI Update'
  },
  
  // Friendly Greetings Feature
  {
    id: 'fg-1',
    title: 'Улучшить логику имён в боте',
    description: 'Использовать first_name || username || "друг" для приветствий',
    status: 'pending',
    priority: 'medium',
    area: 'bot',
    feature: 'Friendly Greetings'
  },
  {
    id: 'fg-2',
    title: 'Обновить шаблон приветствия',
    description: 'Персонализированное приветствие с ролью и списком уведомлений',
    status: 'pending',
    priority: 'medium',
    area: 'bot',
    feature: 'Friendly Greetings'
  },
  {
    id: 'fg-3',
    title: 'Улучшить команду /status',
    description: 'Показывать username, роль и статус уведомлений',
    status: 'pending',
    priority: 'low',
    area: 'bot',
    feature: 'Friendly Greetings'
  },
  
  // UX Enhancement
  {
    id: 'ux-1',
    title: 'Добавить объяснение состояния ожидания',
    description: 'Показать помощник с инструкциями во время ожидания подключения',
    status: 'pending',
    priority: 'medium',
    area: 'frontend',
    feature: 'UX Enhancement'
  }
];

export const TelegramFeatureTracker = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedFeature, setSelectedFeature] = useState<string>('all');

  const features = ['all', 'Real-time UI Update', 'Friendly Greetings', 'UX Enhancement'];
  
  const filteredTasks = selectedFeature === 'all' 
    ? tasks 
    : tasks.filter(task => task.feature === selectedFeature);

  const toggleTaskStatus = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const statusOrder = ['pending', 'in-progress', 'completed'] as const;
        const currentIndex = statusOrder.indexOf(task.status);
        const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
        return { ...task, status: nextStatus };
      }
      return task;
    }));
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getAreaIcon = (area: Task['area']) => {
    switch (area) {
      case 'frontend':
        return <Monitor className="h-4 w-4" />;
      case 'backend':
        return <Zap className="h-4 w-4" />;
      case 'bot':
        return <Bot className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
    }
  };

  const getAreaColor = (area: Task['area']) => {
    switch (area) {
      case 'frontend':
        return 'bg-blue-100 text-blue-800';
      case 'backend':
        return 'bg-purple-100 text-purple-800';
      case 'bot':
        return 'bg-orange-100 text-orange-800';
    }
  };

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const progress = (completedTasks / totalTasks) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Telegram Integration Feature Tracker
          </CardTitle>
          <CardDescription>
            Отслеживание улучшений интеграции с Telegram ботом CallControl
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Общий прогресс</span>
                <span className="text-sm text-gray-600">{completedTasks}/{totalTasks} задач</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {features.map(feature => (
                <Button
                  key={feature}
                  variant={selectedFeature === feature ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFeature(feature)}
                >
                  {feature === 'all' ? 'Все функции' : feature}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Details */}
      {selectedFeature !== 'all' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{selectedFeature}</CardTitle>
            <CardDescription>
              {selectedFeature === 'Real-time UI Update' && 
                "Мгновенное обновление UI при подключении Telegram"}
              {selectedFeature === 'Friendly Greetings' && 
                "Дружелюбные приветствия в Telegram боте"}
              {selectedFeature === 'UX Enhancement' && 
                "Улучшение пользовательского опыта"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedFeature === 'Real-time UI Update' && (
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Цель:</strong> Когда пользователь нажимает /start в Telegram, веб-интерфейс должен мгновенно отразить подключение.</p>
                <p><strong>Результат:</strong> Живая обратная связь в UI, повышение уверенности пользователей.</p>
              </div>
            )}
            {selectedFeature === 'Friendly Greetings' && (
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Цель:</strong> Использовать first_name вместо фамилии или username при приветствии пользователей.</p>
                <p><strong>Результат:</strong> Персонализированные, дружелюбные приветствия бота.</p>
              </div>
            )}
            {selectedFeature === 'UX Enhancement' && (
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Цель:</strong> Объяснить состояние ожидания подключения.</p>
                <p><strong>Результат:</strong> Ясный и поддерживающий UX поток.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleTaskStatus(task.id)}
                  className="mt-1 hover:scale-110 transition-transform"
                >
                  {getStatusIcon(task.status)}
                </button>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                      {task.title}
                    </h4>
                    <div className="flex gap-1">
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline" className={getAreaColor(task.area)}>
                        <span className="flex items-center gap-1">
                          {getAreaIcon(task.area)}
                          {task.area}
                        </span>
                      </Badge>
                    </div>
                  </div>
                  
                  <p className={`text-sm text-gray-600 ${task.status === 'completed' ? 'line-through' : ''}`}>
                    {task.description}
                  </p>
                  
                  <div className="text-xs text-gray-500">
                    Функция: {task.feature}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Implementation Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Рекомендации по реализации
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Frontend
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Используйте React Query для polling</li>
                <li>• Добавьте loading states</li>
                <li>• Обновляйте UI реактивно</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Backend
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Создайте новые Edge Functions</li>
                <li>• Добавьте error handling</li>
                <li>• Логируйте операции</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Telegram Bot
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Обновите message templates</li>
                <li>• Улучшите fallback логику</li>
                <li>• Добавьте role-based ответы</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
