
import { useState } from "react";
import { Phone, Bot, Users } from "lucide-react";
import { OnboardingStepTelfin } from "@/components/onboarding/OnboardingStepTelfin";
import { OnboardingStepTelegram } from "@/components/onboarding/OnboardingStepTelegram";
import { OnboardingStepUsers } from "@/components/onboarding/OnboardingStepUsers";

export type OnboardingStepType = {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  component: React.ElementType;
};

export const useOnboardingSteps = () => {
  const steps: OnboardingStepType[] = [
    {
      id: "telfin",
      title: "Подключение Телфин",
      description: "Настройте интеграцию с вашей IP-телефонией",
      icon: Phone,
      component: OnboardingStepTelfin,
    },
    {
      id: "telegram",
      title: "Настройка Telegram-бота",
      description: "Получайте мгновенные уведомления о звонках",
      icon: Bot,
      component: OnboardingStepTelegram,
    },
    {
      id: "users",
      title: "Добавление пользователей",
      description: "Пригласите команду и настройте роли",
      icon: Users,
      component: OnboardingStepUsers,
    },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>(
    Array(steps.length).fill(false)
  );

  const next = () => {
    if (currentStep < steps.length - 1)
      setCurrentStep((s) => s + 1);
  };

  const prev = () => {
    if (currentStep > 0)
      setCurrentStep((s) => s - 1);
  };

  const completeStep = (index: number) => {
    setCompletedSteps((prev) => {
      const arr = [...prev];
      arr[index] = true;
      return arr;
    });
  };

  const reset = () => {
    setCurrentStep(0);
    setCompletedSteps(Array(steps.length).fill(false));
  };

  return {
    steps,
    currentStep,
    completedSteps,
    next,
    prev,
    reset,
    completeStep,
    setCurrentStep,
    setCompletedSteps
  };
};
