
-- 1. Исправленная функция проверки роли с приведением типа к ENUM
CREATE OR REPLACE FUNCTION public.has_user_role(_role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = _role::user_role
      AND is_active = true
  );
$$;

-- 2. Enable Row Level Security (RLS) and policies on users

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User can see own org users" ON public.users;
DROP POLICY IF EXISTS "User can update their own row" ON public.users;
DROP POLICY IF EXISTS "Superadmin can manage users" ON public.users;

CREATE POLICY "User can see own org users"
  ON public.users
  FOR SELECT
  USING (
    org_id = (SELECT org_id FROM public.users WHERE id = auth.uid())
    AND is_active = true
  );

CREATE POLICY "User can update their own row"
  ON public.users
  FOR UPDATE
  USING (
    id = auth.uid()
  )
  WITH CHECK (id = auth.uid());

CREATE POLICY "Superadmin can manage users"
  ON public.users
  FOR ALL
  TO authenticated
  USING (public.has_user_role('superadmin'));

-- 3. Enable RLS and policies on organizations

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can select org" ON public.organizations;
CREATE POLICY "Admins can select org"
  ON public.organizations
  FOR SELECT
  USING (
    id = (SELECT org_id FROM public.users WHERE id = auth.uid())
    OR public.has_user_role('superadmin')
  );

-- 4. Enable RLS and policies on calls table

ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see org calls" ON public.calls;
CREATE POLICY "Users see org calls"
  ON public.calls
  FOR SELECT
  USING (
    org_id = (SELECT org_id FROM public.users WHERE id = auth.uid())
  );

-- 5. Enable RLS and policies on audit_logs (superadmin only)

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Superadmin can view audit logs" ON public.audit_logs;
CREATE POLICY "Superadmin can view audit logs"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (public.has_user_role('superadmin'));

-- 6. Аналогично RLS можно внедрять для других таблиц (reports, user_sessions, и др.)

