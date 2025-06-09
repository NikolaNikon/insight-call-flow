
-- Создаем таблицу organizations
CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subdomain text UNIQUE,
  settings jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT organizations_name_check CHECK (length(name) >= 1)
);

-- Добавляем org_id в таблицу users
ALTER TABLE public.users 
ADD COLUMN org_id uuid REFERENCES public.organizations(id);

-- Создаем функцию для получения org_id текущего пользователя
CREATE OR REPLACE FUNCTION public.get_current_user_org_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT org_id FROM public.users WHERE id = auth.uid()
$$;

-- Добавляем org_id в существующие таблицы
ALTER TABLE public.calls 
ADD COLUMN org_id uuid REFERENCES public.organizations(id);

ALTER TABLE public.managers 
ADD COLUMN org_id uuid REFERENCES public.organizations(id);

ALTER TABLE public.customers 
ADD COLUMN org_id uuid REFERENCES public.organizations(id);

ALTER TABLE public.reports 
ADD COLUMN org_id uuid REFERENCES public.organizations(id);

-- Обновляем таблицу telegram_links для организационной модели
ALTER TABLE public.telegram_links 
ADD COLUMN org_id uuid REFERENCES public.organizations(id);

-- Создаем таблицу telegram_settings для хранения настроек бота на уровне организации
CREATE TABLE public.telegram_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
  bot_token text NOT NULL,
  bot_username text,
  webhook_url text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT telegram_settings_bot_token_check CHECK (length(bot_token) > 0)
);

-- Создаем таблицы для Dashboard 2.0
CREATE TABLE public.org_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  metric_name text NOT NULL,
  current_value numeric DEFAULT 0,
  target_value numeric,
  unit text DEFAULT 'count',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(org_id, metric_name)
);

CREATE TABLE public.keyword_trackers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  keywords jsonb NOT NULL DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT keyword_trackers_keywords_check CHECK (jsonb_typeof(keywords) = 'array')
);

CREATE TABLE public.call_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id uuid REFERENCES public.calls(id) ON DELETE CASCADE,
  tracker_id uuid REFERENCES public.keyword_trackers(id) ON DELETE CASCADE,
  matched_keywords jsonb DEFAULT '[]',
  match_count integer DEFAULT 0,
  detected_at timestamp with time zone DEFAULT now(),
  CONSTRAINT call_keywords_matched_keywords_check CHECK (jsonb_typeof(matched_keywords) = 'array')
);

CREATE TABLE public.metric_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_id uuid REFERENCES public.org_metrics(id) ON DELETE CASCADE,
  old_value numeric,
  new_value numeric,
  event_type text DEFAULT 'auto' CHECK (event_type IN ('auto', 'manual')),
  triggered_by uuid REFERENCES public.users(id),
  created_at timestamp with time zone DEFAULT now(),
  notes text
);

-- Включаем RLS для всех новых таблиц
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keyword_trackers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metric_history ENABLE ROW LEVEL SECURITY;

-- Создаем RLS политики для organizations
CREATE POLICY "Users can view their organization" 
  ON public.organizations 
  FOR SELECT 
  USING (id = get_current_user_org_id());

CREATE POLICY "Superadmin can view all organizations" 
  ON public.organizations 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- Создаем RLS политики для telegram_settings
CREATE POLICY "Users can view their org telegram settings" 
  ON public.telegram_settings 
  FOR SELECT 
  USING (org_id = get_current_user_org_id());

CREATE POLICY "Admins can manage their org telegram settings" 
  ON public.telegram_settings 
  FOR ALL 
  USING (
    org_id = get_current_user_org_id() AND
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Создаем RLS политики для org_metrics
CREATE POLICY "Users can view their org metrics" 
  ON public.org_metrics 
  FOR SELECT 
  USING (org_id = get_current_user_org_id());

CREATE POLICY "Admins can manage their org metrics" 
  ON public.org_metrics 
  FOR ALL 
  USING (
    org_id = get_current_user_org_id() AND
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'superadmin')
    )
  );

-- Создаем RLS политики для keyword_trackers
CREATE POLICY "Users can view their org keyword trackers" 
  ON public.keyword_trackers 
  FOR SELECT 
  USING (org_id = get_current_user_org_id());

CREATE POLICY "Admins can manage their org keyword trackers" 
  ON public.keyword_trackers 
  FOR ALL 
  USING (
    org_id = get_current_user_org_id() AND
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'superadmin')
    )
  );

-- Создаем RLS политики для call_keywords
CREATE POLICY "Users can view their org call keywords" 
  ON public.call_keywords 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.calls c 
      WHERE c.id = call_keywords.call_id AND c.org_id = get_current_user_org_id()
    )
  );

-- Создаем RLS политики для metric_history
CREATE POLICY "Users can view their org metric history" 
  ON public.metric_history 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.org_metrics m 
      WHERE m.id = metric_history.metric_id AND m.org_id = get_current_user_org_id()
    )
  );

-- Обновляем RLS политики для существующих таблиц
DROP POLICY IF EXISTS "Users can view their org calls" ON public.calls;
CREATE POLICY "Users can view their org calls" 
  ON public.calls 
  FOR SELECT 
  USING (org_id = get_current_user_org_id());

DROP POLICY IF EXISTS "Users can view their org managers" ON public.managers;
CREATE POLICY "Users can view their org managers" 
  ON public.managers 
  FOR SELECT 
  USING (org_id = get_current_user_org_id());

DROP POLICY IF EXISTS "Users can view their org customers" ON public.customers;
CREATE POLICY "Users can view their org customers" 
  ON public.customers 
  FOR SELECT 
  USING (org_id = get_current_user_org_id());

DROP POLICY IF EXISTS "Users can view their org reports" ON public.reports;
CREATE POLICY "Users can view their org reports" 
  ON public.reports 
  FOR SELECT 
  USING (org_id = get_current_user_org_id());

-- Обновляем RLS для telegram_links
DROP POLICY IF EXISTS "Users can view their telegram links" ON public.telegram_links;
CREATE POLICY "Users can view their org telegram links" 
  ON public.telegram_links 
  FOR SELECT 
  USING (org_id = get_current_user_org_id());

-- Создаем VIEW для активных NSM метрик
CREATE OR REPLACE VIEW public.v_active_nsm AS
SELECT 
  m.*,
  o.name as org_name,
  o.subdomain as org_subdomain
FROM public.org_metrics m
JOIN public.organizations o ON m.org_id = o.id
WHERE m.is_active = true;

-- Создаем VIEW для дашборда организации
CREATE OR REPLACE VIEW public.v_org_dashboard_metrics AS
SELECT 
  o.id as org_id,
  o.name as org_name,
  COUNT(c.id) as total_calls,
  AVG(c.general_score) as avg_score,
  AVG(c.user_satisfaction_index) as avg_satisfaction,
  COUNT(DISTINCT c.manager_id) as active_managers,
  COUNT(kt.id) as active_trackers
FROM public.organizations o
LEFT JOIN public.calls c ON c.org_id = o.id 
  AND c.created_at >= CURRENT_DATE - INTERVAL '30 days'
LEFT JOIN public.keyword_trackers kt ON kt.org_id = o.id 
  AND kt.is_active = true
GROUP BY o.id, o.name;

-- Создаем функцию для получения истории метрик
CREATE OR REPLACE FUNCTION public.get_metric_trend(
  metric_id_param uuid,
  days_back integer DEFAULT 30
)
RETURNS TABLE (
  date date,
  value numeric,
  change_percent numeric
)
LANGUAGE sql
STABLE
AS $$
  WITH daily_values AS (
    SELECT 
      DATE(created_at) as date,
      new_value as value,
      LAG(new_value) OVER (ORDER BY created_at) as prev_value
    FROM public.metric_history 
    WHERE metric_id = metric_id_param
      AND created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
    ORDER BY created_at
  )
  SELECT 
    date,
    value,
    CASE 
      WHEN prev_value IS NULL OR prev_value = 0 THEN NULL
      ELSE ROUND(((value - prev_value) / prev_value * 100)::numeric, 2)
    END as change_percent
  FROM daily_values;
$$;

-- Создаем триггер для обновления updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_organizations_updated_at 
  BEFORE UPDATE ON public.organizations 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_telegram_settings_updated_at 
  BEFORE UPDATE ON public.telegram_settings 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_org_metrics_updated_at 
  BEFORE UPDATE ON public.org_metrics 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_keyword_trackers_updated_at 
  BEFORE UPDATE ON public.keyword_trackers 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Создаем default organization для миграции данных
INSERT INTO public.organizations (name, subdomain, settings) 
VALUES ('Default Organization', 'default', '{"migrated": true}');

-- Обновляем существующих пользователей, присваивая им default organization
UPDATE public.users 
SET org_id = (SELECT id FROM public.organizations WHERE subdomain = 'default')
WHERE org_id IS NULL;

-- Обновляем существующие записи, присваивая им default organization
UPDATE public.calls 
SET org_id = (SELECT id FROM public.organizations WHERE subdomain = 'default')
WHERE org_id IS NULL;

UPDATE public.managers 
SET org_id = (SELECT id FROM public.organizations WHERE subdomain = 'default')
WHERE org_id IS NULL;

UPDATE public.customers 
SET org_id = (SELECT id FROM public.organizations WHERE subdomain = 'default')
WHERE org_id IS NULL;

UPDATE public.reports 
SET org_id = (SELECT id FROM public.organizations WHERE subdomain = 'default')
WHERE org_id IS NULL;

UPDATE public.telegram_links 
SET org_id = (SELECT id FROM public.organizations WHERE subdomain = 'default')
WHERE org_id IS NULL;

-- Делаем org_id обязательным после миграции
ALTER TABLE public.users ALTER COLUMN org_id SET NOT NULL;
ALTER TABLE public.calls ALTER COLUMN org_id SET NOT NULL;
ALTER TABLE public.managers ALTER COLUMN org_id SET NOT NULL;
ALTER TABLE public.customers ALTER COLUMN org_id SET NOT NULL;
ALTER TABLE public.reports ALTER COLUMN org_id SET NOT NULL;
ALTER TABLE public.telegram_links ALTER COLUMN org_id SET NOT NULL;
