
import React, { useState } from "react";
import { useOrganization } from "@/hooks/useOrganization";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/useUserRole";
import { ChangePasswordDialog } from "./ChangePasswordDialog";

const ProfileBasics = () => {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const { userRole, isLoading } = useUserRole();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  return (
    <>
      <div className="space-y-2">
        <div>
          <strong>Имя:</strong> {user?.user_metadata?.name || "—"}
        </div>
        <div>
          <strong>Email:</strong> {user?.email}
        </div>
        <div>
          <strong>Роль:</strong>{" "}
          {isLoading ? (
            <span className="text-gray-500">Загрузка...</span>
          ) : (
            <Badge variant="outline">{userRole || "viewer"}</Badge>
          )}
        </div>
        <div>
          <strong>Организация:</strong> {organization?.name || "—"}
        </div>
        <div className="mt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsChangePasswordOpen(true)}
          >
            Сменить пароль
          </Button>
        </div>
      </div>
      <ChangePasswordDialog
        isOpen={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
      />
    </>
  );
};

export default ProfileBasics;
