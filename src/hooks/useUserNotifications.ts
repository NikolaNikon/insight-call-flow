
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";

export const useUserNotifications = () => {
  const user = useUser();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("user_notifications")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line
  }, [user?.id]);

  const updateNotifications = async (next: Partial<any>) => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("user_notifications")
      .upsert({ ...notifications, ...next, user_id: user.id }, { onConflict: "user_id" });
    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    } else {
      setNotifications({ ...notifications, ...next });
    }
    setLoading(false);
  };

  return { notifications: notifications || {}, updateNotifications, loading };
};
