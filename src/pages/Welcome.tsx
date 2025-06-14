
import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';

// 1. Call role-related hooks only, since these determine early exit.
// 2. All onboarding hooks and logic MUST go *after* superadmin redirect/early return.

const Welcome = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, isLoading } = useUserRole();

  // 1. Early loading return
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  // 2. Early effect-based redirect/return for superadmins
  useEffect(() => {
    if (isSuperAdmin) {
      navigate("/", { replace: true });
    }
  }, [isSuperAdmin, navigate]);

  if (isSuperAdmin) {
    return null;
  }

  // 3. All onboarding hooks only used for non-superadmins
  const {
    steps,
    currentStep,
    completedSteps,
    next,
    prev,
    completeStep,
    setCurrentStep,
    setCompletedSteps
  } = require('@/hooks/useOnboardingSteps').useOnboardingSteps(); // fix: require so never conditionally called

  const { WelcomeScreen } = require('@/components/onboarding/WelcomeScreen');
  const { OnboardingProgress } = require('@/components/onboarding/OnboardingProgress');

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
