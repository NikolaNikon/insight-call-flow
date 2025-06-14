
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import React from "react";
import { OnboardingStepType } from "@/hooks/useOnboardingSteps";

interface OnboardingProgressProps {
  steps: OnboardingStepType[];
  currentStep: number;
  completedSteps: boolean[];
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onCompleteStep: () => void;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  steps,
  currentStep,
  completedSteps,
  onNext,
  onPrev,
  onSkip,
  onCompleteStep,
}) => {
  const progressValue = ((currentStep + 1) / steps.length) * 100;
  const StepComponent = steps[currentStep].component;
  const StepIcon = steps[currentStep].icon;

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
              <StepIcon className="h-6 w-6" />
              {steps[currentStep].title}
            </CardTitle>
            <CardDescription>
              {steps[currentStep].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StepComponent 
              onComplete={onCompleteStep}
              isCompleted={completedSteps[currentStep]}
            />
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={onPrev}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
          
          <div className="space-x-2">
            <Button variant="ghost" onClick={onSkip}>
              Пропустить
            </Button>
            <Button 
              onClick={onNext}
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
