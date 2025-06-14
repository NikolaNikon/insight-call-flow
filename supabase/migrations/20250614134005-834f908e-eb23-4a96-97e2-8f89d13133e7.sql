
-- Исправляем RLS политики для таблицы users, убираем рекурсию

-- Удаляем проблемную политику, которая вызывает рекурсию
DROP POLICY IF EXISTS "User can see own org users" ON public.users;

-- Создаем безопасную функцию для получения org_id текущего пользователя
CREATE OR REPLACE FUNCTION public.get_current_user_org_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT org_id FROM public.users WHERE id = auth.uid()
$$;

-- Создаем новую политику без рекурсии
CREATE POLICY "Users can see org users"
  ON public.users
  FOR SELECT
  USING (
    org_id = public.get_current_user_org_id()
    OR public.has_user_role('superadmin')
  );

-- Улучшаем политику для суперадмина
DROP POLICY IF EXISTS "Superadmin can manage users" ON public.users;
CREATE POLICY "Superadmin can manage users"
  ON public.users
  FOR ALL
  TO authenticated
  USING (public.has_user_role('superadmin'))
  WITH CHECK (public.has_user_role('superadmin'));
