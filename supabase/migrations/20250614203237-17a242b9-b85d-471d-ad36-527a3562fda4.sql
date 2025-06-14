
-- Удаляем старую политику, которая была слишком строгой
DROP POLICY IF EXISTS "Admins can manage telfin_connections" ON public.telfin_connections;

-- Новая политика: разрешаем пользователям просматривать настройки в своей организации
CREATE POLICY "Users can view telfin_connections in their org"
ON public.telfin_connections
FOR SELECT
USING (org_id = public.get_current_user_org_id());

-- Новая политика: разрешаем администраторам создавать настройки для своей организации
CREATE POLICY "Admins can insert telfin_connections"
ON public.telfin_connections
FOR INSERT
WITH CHECK (public.has_user_role('admin') AND org_id = public.get_current_user_org_id());

-- Новая политика: разрешаем администраторам обновлять настройки для своей организации
CREATE POLICY "Admins can update telfin_connections"
ON public.telfin_connections
FOR UPDATE
USING (public.has_user_role('admin') AND org_id = public.get_current_user_org_id())
WITH CHECK (public.has_user_role('admin') AND org_id = public.get_current_user_org_id());

-- Новая политика: разрешаем администраторам удалять настройки для своей организации
CREATE POLICY "Admins can delete telfin_connections"
ON public.telfin_connections
FOR DELETE
USING (public.has_user_role('admin') AND org_id = public.get_current_user_org_id());
