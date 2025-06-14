
-- 1. User Preferences
CREATE TABLE public.user_preferences (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  locale text DEFAULT 'ru',
  theme text DEFAULT 'light',
  preferred_nsm uuid REFERENCES org_metrics(id),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their preferences"
  ON public.user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can modify their preferences"
  ON public.user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their preferences"
  ON public.user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 2. User Notifications
CREATE TABLE public.user_notifications (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  notify_calls boolean DEFAULT true,
  notify_risks boolean DEFAULT true,
  notify_metrics boolean DEFAULT true,
  channel text DEFAULT 'telegram'
);

ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications"
  ON public.user_notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can modify their notifications"
  ON public.user_notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their notifications"
  ON public.user_notifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. User Sessions
CREATE TABLE public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  ip_address text,
  user_agent text
);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their sessions"
  ON public.user_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete all their sessions"
  ON public.user_sessions
  FOR DELETE
  USING (auth.uid() = user_id);
