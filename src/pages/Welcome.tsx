
import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useImpersonateOrg } from '@/hooks/useImpersonateOrg';
import { supabase } from '@/integrations/supabase/client';
import { useOnboardingSteps } from '@/hooks/useOnboardingSteps';
import { WelcomeScreen } from '@/components/onboarding/WelcomeScreen';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';

// All hooks MUST be called unconditionally at the top of the component!
const Welcome = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, isLoading } = useUserRole();
  const { orgId, setOrgId } = useImpersonateOrg();
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

  // НЕМЕДЛЕННЫЙ редирект для суперадмина (без ожидания useEffect)
  if (!isLoading && isSuperAdmin) {
    console.log('🔄 Суперадмин обнаружен, редирект на главную страницу');
    navigate('/', { replace: true });
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  // Demo org auto-assign for superadmin (в фоне для будущих заходов)
  useEffect(() => {
    if (isSuperAdmin && !orgId) {
      console.log('🏢 Автоназначение DEMO организации для суперадмина');
      const autoAssignOrCreateDemoOrg = async () => {
        const { data: org, error } = await supabase
          .from('organizations')
          .select('id')
          .eq('subdomain', 'demo')
          .maybeSingle();
        if (error) {
          console.error('Ошибка поиска DEMO-организации:', error);
          return;
        }
        if (org && org.id) {
          setOrgId(org.id);
        } else {
          const { data: created, error: createError } = await supabase
            .from('organizations')
            .insert({
              name: 'DEMO',
              subdomain: 'demo',
              is_active: true,
              settings: {},
            })
            .select('id')
            .single();
          if (createError) {
            console.error('Ошибка создания DEMO-организации:', createError);
            return;
          }
          if (created?.id) setOrgId(created.id);
        }
      };
      autoAssignOrCreateDemoOrg();
    }
  }, [isSuperAdmin, orgId, setOrgId]);

  // Always render the loader while loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  // ---- Обычная онбординг-логика для обычных пользователей ----
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
