
-- Добавляем колонку для ID организации
ALTER TABLE public.telegram_sessions
ADD COLUMN org_id UUID;

-- Обновляем существующие записи, если они есть
UPDATE public.telegram_sessions s
SET org_id = u.org_id
FROM public.users u
WHERE s.user_id = u.id AND s.org_id IS NULL;

-- Устанавливаем ограничение NOT NULL, так как ID организации обязателен
ALTER TABLE public.telegram_sessions
ALTER COLUMN org_id SET NOT NULL;

-- Добавляем внешний ключ для целостности данных
ALTER TABLE public.telegram_sessions
ADD CONSTRAINT telegram_sessions_org_id_fkey
FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
