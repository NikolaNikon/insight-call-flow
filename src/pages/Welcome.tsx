
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Phone, Bot, Users, ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingStepTelfin } from '@/components/onboarding/OnboardingStepTelfin';
import { OnboardingStepTelegram } from '@/components/onboarding/OnboardingStepTelegram';
import { OnboardingStepUsers } from '@/components/onboarding/OnboardingStepUsers';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false]);
  const navigate = useNavigate();

  const steps = [
    {
      id: 'telfin',
      title: 'Подключение Телфин',
      description: 'Настройте интеграцию с вашей IP-телефонией',
      icon: Phone,
      component: OnboardingStepTelfin
    },
    {
      id: 'telegram',
      title: 'Настройка Telegram-бота',
      description: 'Получайте мгновенные уведомления о звонках',
      icon: Bot,
      component: OnboardingStepTelegram
    },
    {
      id: 'users',
      title: 'Добавление пользователей',
      description: 'Пригласите команду и настройте роли',
      icon: Users,
      component: OnboardingStepUsers
    }
  ];

  const handleStepComplete = (stepIndex: number) => {
    const newCompletedSteps = [...completedSteps];
    newCompletedSteps[stepIndex] = true;
    setCompletedSteps(newCompletedSteps);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Завершение onboarding
      localStorage.setItem('onboarding_completed', 'true');
      navigate('/');
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true');
    navigate('/');
  };

  const progressValue = ((currentStep + 1) / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep].component;

  if (currentStep === -1) {
    // Welcome screen
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Добро пожаловать в CallControl
            </h1>
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
              onClick={() => setCurrentStep(0)}
            >
              Начать настройку
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <div>
              <Button 
                variant="ghost" 
                onClick={handleSkipOnboarding}
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
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Настройка CallControl
            </h1>
            <div className="text-sm text-gray-500">
              Шаг {currentStep + 1} из {steps.length}
            </div>
          </div>
          <Progress value={progressValue} className="mb-4" />
          <div className="flex items-center gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = completedSteps[index];
              
              return (
                <div 
                  key={step.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-100 text-blue-700' 
                      : isCompleted 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                  <span className="font-medium">{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <steps[currentStep].icon className="h-6 w-6" />
              {steps[currentStep].title}
            </CardTitle>
            <CardDescription>
              {steps[currentStep].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CurrentStepComponent 
              onComplete={() => handleStepComplete(currentStep)}
              isCompleted={completedSteps[currentStep]}
            />
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
          
          <div className="space-x-2">
            <Button variant="ghost" onClick={handleSkipOnboarding}>
              Пропустить
            </Button>
            <Button 
              onClick={handleNext}
              disabled={!completedSteps[currentStep]}
            >
              {currentStep === steps.length - 1 ? 'Завершить' : 'Далее'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
