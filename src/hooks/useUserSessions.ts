
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";

export const useUserSessions = () => {
  const user = useUser();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSessions = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    setSessions(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line
  }, [user?.id]);

  const logoutAll = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("user_sessions")
      .delete()
      .eq("user_id", user.id);
    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Вышли на всех устройствах" });
      fetchSessions();
    }
    setLoading(false);
  };

  return { sessions, loading, logoutAll };
};
