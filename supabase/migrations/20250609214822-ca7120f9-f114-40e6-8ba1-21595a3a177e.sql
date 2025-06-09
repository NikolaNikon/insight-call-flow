
-- Добавляем поле категории в таблицу keyword_trackers
ALTER TABLE public.keyword_trackers 
ADD COLUMN category text NOT NULL DEFAULT 'Общие';

-- Добавляем поле для кешированного счетчика упоминаний
ALTER TABLE public.keyword_trackers 
ADD COLUMN mentions_count integer DEFAULT 0;

-- Создаем индекс для быстрой фильтрации по категориям
CREATE INDEX idx_keyword_trackers_category 
ON public.keyword_trackers(category) 
WHERE is_active = true;

-- Создаем индекс для сортировки по упоминаниям
CREATE INDEX idx_keyword_trackers_mentions 
ON public.keyword_trackers(mentions_count DESC) 
WHERE is_active = true;

-- Обновляем существующие записи, присваивая категорию по умолчанию
UPDATE public.keyword_trackers 
SET category = 'Общие' 
WHERE category IS NULL;
