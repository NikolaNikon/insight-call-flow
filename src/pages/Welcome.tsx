import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useImpersonateOrg } from '@/hooks/useImpersonateOrg';
import { supabase } from '@/integrations/supabase/client';
import { useOnboardingSteps } from '@/hooks/useOnboardingSteps';
import { WelcomeScreen } from '@/components/onboarding/WelcomeScreen';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';

// Hooks must be called in the same order for every render
const Welcome = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, isLoading } = useUserRole();
  const { orgId, setOrgId } = useImpersonateOrg();

  // ---- НОВОЕ: если это суперадмин, сразу перебрасываем с welcome на главную (редирект) ----
  if (isLoading) {
    // Во время загрузки — просто лоадер (иначе возможен мигающий лишний контент)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }
  if (isSuperAdmin) {
    // Хардконтролируем: мгновенный редирект (без показа welcome)
    navigate("/", { replace: true });
    return null;
  }

  // Onboarding hooks — всегда вызываем
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

  // --- Автоматическая инициализация DEMO организации для сверхпользователя
  useEffect(() => {
    const autoAssignOrCreateDemoOrg = async () => {
      if (!isSuperAdmin || orgId) return;

      // 1. Поиск demo-организации
      const { data: org, error } = await supabase
        .from('organizations')
        .select('id')
        .eq('subdomain', 'demo')
        .maybeSingle();

      if (error) {
        // eslint-disable-next-line no-console
        console.error('Ошибка поиска DEMO-организации:', error);
        return;
      }

      if (org && org.id) {
        // Если нашли — выставляем
        setOrgId(org.id);
      } else {
        // Нет — создаём новую DEMO-организацию
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
          // eslint-disable-next-line no-console
          console.error('Ошибка создания DEMO-организации:', createError);
          return;
        }
        if (created?.id) {
          setOrgId(created.id);
        }
      }
    };
    autoAssignOrCreateDemoOrg();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin, orgId, setOrgId]);

  // --- Строго блокируем всё на этом экране для суперадмина, кроме редиректа/лоадера
  useEffect(() => {
    if (isSuperAdmin && orgId) {
      navigate("/", { replace: true });
    }
  }, [isSuperAdmin, orgId, navigate]);

  // Если роль пользователя загружается — показываем лоадер
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  // Если определили, что пользователь — суперадмин, не показываем ничего (ждём редиректа)
  if (isSuperAdmin) {
    return null;
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
