
-- Добавляем колонку для хранения текста ошибки при обработке
ALTER TABLE public.telfin_calls
ADD COLUMN processing_feedback TEXT;
