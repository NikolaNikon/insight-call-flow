
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Building2, LogIn } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useImpersonateOrg } from "@/hooks/useImpersonateOrg";

export function SuperadminOrgSelector() {
  const { setOrgId, orgId } = useImpersonateOrg();

  // Грузим все организации
  const { data: orgs, isLoading } = useQuery({
    queryKey: ["all-organizations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin h-7 w-7 text-blue-500" />
      </div>
    );
  }

  if (!orgs || orgs.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        Нет организаций
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <Building2 className="h-5 w-5" />
            Список всех организаций
          </CardTitle>
          <CardDescription>
            Выберите организацию для просмотра данных с правами суперадмина
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orgs.map((org: any) => (
              <div className="flex items-center justify-between px-3 py-3 border rounded-lg" key={org.id}>
                <div>
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    {org.name}
                    <Badge variant="outline" className="ml-1">{org.subdomain || "без поддомена"}</Badge>
                    {!org.is_active && (
                      <Badge variant="destructive">Неактивна</Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{org.id}</div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => setOrgId(org.id)}
                  variant={orgId === org.id ? "default" : "outline"}
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  {orgId === org.id ? "Текущая" : "Войти"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
