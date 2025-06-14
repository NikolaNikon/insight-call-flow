
-- Создаем таблицу для хранения настроек подключения к Telphin для каждой организации
CREATE TABLE public.telfin_connections (
  org_id uuid NOT NULL PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id text NOT NULL,
  client_secret text NOT NULL,
  access_token text,
  refresh_token text,
  token_expiry timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Включаем защиту на уровне строк
ALTER TABLE public.telfin_connections ENABLE ROW LEVEL SECURITY;

-- Политика: только администраторы могут управлять настройками подключения
CREATE POLICY "Admins can manage telfin_connections"
ON public.telfin_connections
FOR ALL
USING (public.has_user_role('admin'))
WITH CHECK (public.has_user_role('admin'));

-- Создаем таблицу для логов звонков, поступающих от Telphin через webhook
CREATE TABLE public.telfin_calls (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id text NOT NULL UNIQUE,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  extension_id text,
  caller_number text,
  called_number text,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  duration integer,
  has_record boolean,
  record_url text,
  status text,
  processing_status text DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Включаем защиту на уровне строк
ALTER TABLE public.telfin_calls ENABLE ROW LEVEL SECURITY;

-- Политика: пользователи могут видеть лог звонков Telphin в своей организации
CREATE POLICY "Users can view telfin_calls within their organization"
ON public.telfin_calls
FOR SELECT
USING (org_id = public.get_current_user_org_id());

-- Добавляем колонку "source", чтобы различать звонки, загруженные вручную и из Telphin
ALTER TABLE public.calls
ADD COLUMN source text DEFAULT 'manual'::text;

-- Добавляем колонку для связи с оригинальным ID звонка из Telphin
ALTER TABLE public.calls
ADD COLUMN source_call_id text;

-- Добавляем индекс для быстрого поиска по ID звонка из Telphin
CREATE INDEX idx_calls_source_call_id ON public.calls(source_call_id);

-- Триггер для автоматического обновления поля updated_at в telfin_connections
CREATE TRIGGER handle_updated_at_telfin_connections
BEFORE UPDATE ON public.telfin_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Триггер для автоматического обновления поля updated_at в telfin_calls
CREATE TRIGGER handle_updated_at_telfin_calls
BEFORE UPDATE ON public.telfin_calls
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

