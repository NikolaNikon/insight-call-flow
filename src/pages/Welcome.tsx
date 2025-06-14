
import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';

// Early exit for loading and superadmin
const Welcome = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, isLoading } = useUserRole();

  // Show loader while loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  // Redirect superadmins, no onboarding
  useEffect(() => {
    if (isSuperAdmin) {
      navigate("/", { replace: true });
    }
  }, [isSuperAdmin, navigate]);
  if (isSuperAdmin) {
    return null;
  }

  // Only import/use onboarding logic/components when not superadmin and not loading
  // (avoids extra hook calls on superadmin renders)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useOnboardingSteps } = require('@/hooks/useOnboardingSteps');
  const { WelcomeScreen } = require('@/components/onboarding/WelcomeScreen');
  const { OnboardingProgress } = require('@/components/onboarding/OnboardingProgress');

  const {
    steps,
    currentStep,
    completedSteps,
    next,
    prev,
    completeStep,
    setCurrentStep,
    setCompletedSteps
  } = useOnboardingSteps();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      next();
    } else {
      localStorage.setItem('onboarding_completed', 'true');
      window.dispatchEvent(new Event('onboardingCompleted'));
      navigate('/');
    }
  };
  const handlePrev = () => prev();
  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    window.dispatchEvent(new Event('onboardingCompleted'));
    navigate('/');
  };
  const handleCompleteStep = () => completeStep(currentStep);

  if (currentStep === -1) {
    return (
      <WelcomeScreen
        steps={steps}
        onStart={() => setCurrentStep(0)}
        onSkip={handleSkip}
      />
    );
  }

  return (
    <OnboardingProgress
      steps={steps}
      currentStep={currentStep}
      completedSteps={completedSteps}
      onNext={handleNext}
      onPrev={handlePrev}
      onSkip={handleSkip}
      onCompleteStep={handleCompleteStep}
    />
  );
};

export default Welcome;

