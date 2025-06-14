
import React from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { useOrganization } from "@/hooks/useOrganization";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const ProfileBasics = () => {
  const { user } = useAuth();
  const { organization } = useOrganization();

  return (
    <div className="space-y-2">
      <div>
        <strong>Имя:</strong> {user?.user_metadata?.name || "—"}
      </div>
      <div>
        <strong>Email:</strong> {user?.email}
      </div>
      <div>
        <strong>Роль:</strong>{" "}
        <Badge variant="outline">{user?.user_metadata?.role || "viewer"}</Badge>
      </div>
      <div>
        <strong>Организация:</strong> {organization?.name || "—"}
      </div>
      <div className="mt-4">
        <Button size="sm" variant="outline" disabled>
          Сменить пароль (скоро)
        </Button>
      </div>
    </div>
  );
};

export default ProfileBasics;
