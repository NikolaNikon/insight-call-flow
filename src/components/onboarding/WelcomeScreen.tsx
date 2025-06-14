
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import React from "react";
import { OnboardingStepType } from "@/hooks/useOnboardingSteps";

interface WelcomeScreenProps {
  steps: OnboardingStepType[];
  onStart: () => void;
  onSkip: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ steps, onStart, onSkip }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
    <div className="max-w-4xl w-full">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Добро пожаловать в CallControl</h1>
        <p className="text-xl text-gray-600 mb-8">
          Контролируйте, как общаются ваши менеджеры.<br />
          Подключите телефонию, настройте Telegram-бота и получайте отчёты о звонках.
        </p>
        <div className="inline-flex items-center gap-2 text-lg text-green-600 font-medium mb-8">
          <CheckCircle className="h-6 w-6" />
          Настройка за 3 шага. Всё под контролем.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <Card key={step.id} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Icon className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500">Шаг {index + 1} из 3</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center space-y-4">
        <Button 
          size="lg" 
          className="bg-blue-600 hover:bg-blue-700 px-8"
          onClick={onStart}
        >
          Начать настройку
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        <div>
          <Button 
            variant="ghost" 
            onClick={onSkip}
            className="text-gray-500"
          >
            Пропустить и перейти к дашборду
          </Button>
        </div>
      </div>

      <div className="mt-12 text-center text-sm text-gray-500">
        <p>💡 Вы сможете настроить всё это позже в разделе "Настройки"</p>
      </div>
    </div>
  </div>
);
