
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Settings, HelpCircle, BookOpen } from 'lucide-react';

interface ArticleTemplateSelectorProps {
  onSelect: (template: string, content: string) => void;
}

const templates = [
  {
    id: 'instruction',
    name: 'Инструкция',
    description: 'Пошаговое руководство для выполнения задач',
    icon: FileText,
    content: `# Название инструкции

## Обзор
Краткое описание того, что будет изучено или выполнено.

## Предварительные требования
- Требование 1
- Требование 2

## Пошаговая инструкция

### Шаг 1: Название шага
Подробное описание первого шага.

### Шаг 2: Название шага
Подробное описание второго шага.

## Результат
Описание ожидаемого результата.

## Возможные проблемы
- Проблема 1 и её решение
- Проблема 2 и её решение`
  },
  {
    id: 'integration',
    name: 'Интеграция',
    description: 'Настройка подключения к внешним сервисам',
    icon: Settings,
    content: `# Интеграция с [Название сервиса]

## Описание
Краткое описание интеграции и её возможностей.

## Настройка

### 1. Получение учетных данных
Инструкции по получению API ключей или других данных.

### 2. Конфигурация в CallControl
1. Перейдите в **Настройки → Интеграции**
2. Найдите раздел "[Название сервиса]"
3. Заполните поля:
   - **Поле 1**: описание
   - **Поле 2**: описание

### 3. Тестирование
Как проверить работоспособность интеграции.

## Функциональность
- Функция 1
- Функция 2

## Устранение неполадок
Распространенные проблемы и их решения.`
  },
  {
    id: 'faq',
    name: 'FAQ',
    description: 'Часто задаваемые вопросы и ответы',
    icon: HelpCircle,
    content: `# Часто задаваемые вопросы

## Общие вопросы

### Вопрос 1
**Ответ:** Подробный ответ на первый вопрос.

### Вопрос 2
**Ответ:** Подробный ответ на второй вопрос.

## Технические вопросы

### Вопрос 3
**Ответ:** Технический ответ с примерами.

### Вопрос 4
**Ответ:** Ответ с инструкциями.

## Не нашли ответ?
Если вашего вопроса нет в списке, обратитесь в поддержку.`
  },
  {
    id: 'general',
    name: 'Общая статья',
    description: 'Универсальный шаблон для любого типа документации',
    icon: BookOpen,
    content: `# Заголовок статьи

## Введение
Краткое описание темы статьи.

## Основная часть
Подробное описание с примерами и объяснениями.

### Подраздел 1
Содержание подраздела.

### Подраздел 2
Содержание подраздела.

## Заключение
Краткие выводы и следующие шаги.`
  }
];

export const ArticleTemplateSelector = ({ onSelect }: ArticleTemplateSelectorProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {templates.map((template) => {
        const Icon = template.icon;
        return (
          <Card 
            key={template.id} 
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => onSelect(template.id, template.content)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="outline" className="w-full">
                Использовать шаблон
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
