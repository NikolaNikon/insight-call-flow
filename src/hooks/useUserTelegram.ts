
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";

export const useUserTelegram = () => {
  const user = useUser();
  const { toast } = useToast();
  const [telegram, setTelegram] = useState<any>(null);
  const [connecting, setConnecting] = useState(false);

  const fetchTelegram = async () => {
    if (!user) return;
    setConnecting(true);
    const { data, error } = await supabase
      .from("telegram_links")
      .select("*")
      .eq("user_id", user.id)
      .eq("active", true)
      .maybeSingle();
    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
      setConnecting(false);
      return;
    }
    setTelegram(data);
    setConnecting(false);
  };

  useEffect(() => {
    fetchTelegram();
    // eslint-disable-next-line
  }, [user?.id]);

  const disconnectTelegram = async () => {
    if (!telegram?.id) return;
    setConnecting(true);
    const { error } = await supabase
      .from("telegram_links")
      .update({ active: false })
      .eq("id", telegram.id);
    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    } else {
      setTelegram({ ...telegram, active: false });
      toast({ title: "Telegram-бот отключён" });
    }
    setConnecting(false);
  };

  return { telegram, connecting, disconnectTelegram };
};
