
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@supabase/auth-helpers-react";

export const useUserPreferences = () => {
  const user = useUser();
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [nsmMetrics, setNsmMetrics] = useState<any[]>([]);

  const fetchPrefs = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    setPrefs(data);
    setLoading(false);
  };

  const fetchNsm = async () => {
    const { data } = await supabase
      .from("org_metrics")
      .select("id,metric_name")
      .limit(20);
    setNsmMetrics(data || []);
  };

  useEffect(() => {
    fetchPrefs();
    fetchNsm();
    // eslint-disable-next-line
  }, [user?.id]);

  const updatePreferences = async (next: Partial<any>) => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("user_preferences")
      .upsert({ ...prefs, ...next, user_id: user.id }, { onConflict: "user_id" });
    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    } else {
      setPrefs({ ...prefs, ...next });
    }
    setLoading(false);
  };

  return { prefs: prefs || {}, updatePreferences, loading, nsmMetrics };
};
