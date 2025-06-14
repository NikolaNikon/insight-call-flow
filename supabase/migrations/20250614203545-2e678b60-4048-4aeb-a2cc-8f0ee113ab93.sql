
-- Удаляем старые, некорректные политики
DROP POLICY IF EXISTS "Users can view telfin_connections in their org" ON public.telfin_connections;
DROP POLICY IF EXISTS "Admins can insert telfin_connections" ON public.telfin_connections;
DROP POLICY IF EXISTS "Admins can update telfin_connections" ON public.telfin_connections;
DROP POLICY IF EXISTS "Admins can delete telfin_connections" ON public.telfin_connections;

-- Новая политика SELECT: разрешаем суперадминистраторам видеть все, а остальным пользователям - только в своей организации
CREATE POLICY "Users can view telfin_connections"
ON public.telfin_connections
FOR SELECT
USING (
  public.has_user_role('superadmin') OR 
  org_id = public.get_current_user_org_id()
);

-- Новая политика INSERT: разрешаем суперадминистраторам и администраторам создавать настройки
CREATE POLICY "Admins can insert telfin_connections"
ON public.telfin_connections
FOR INSERT
WITH CHECK (
  public.has_user_role('superadmin') OR 
  (public.has_user_role('admin') AND org_id = public.get_current_user_org_id())
);

-- Новая политика UPDATE: разрешаем суперадминистраторам и администраторам обновлять настройки
CREATE POLICY "Admins can update telfin_connections"
ON public.telfin_connections
FOR UPDATE
USING (
  public.has_user_role('superadmin') OR 
  (public.has_user_role('admin') AND org_id = public.get_current_user_org_id())
)
WITH CHECK (
  public.has_user_role('superadmin') OR 
  (public.has_user_role('admin') AND org_id = public.get_current_user_org_id())
);

-- Новая политика DELETE: разрешаем суперадминистраторам и администраторам удалять настройки
CREATE POLICY "Admins can delete telfin_connections"
ON public.telfin_connections
FOR DELETE
USING (
  public.has_user_role('superadmin') OR 
  (public.has_user_role('admin') AND org_id = public.get_current_user_org_id())
);
