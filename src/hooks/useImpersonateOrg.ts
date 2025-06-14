
import { useState, useEffect } from "react";

export function useImpersonateOrg() {
  const [orgId, setOrgId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("superadmin_impersonate_org_id") || null;
    }
    return null;
  });

  useEffect(() => {
    if (orgId) {
      localStorage.setItem("superadmin_impersonate_org_id", orgId);
    } else {
      localStorage.removeItem("superadmin_impersonate_org_id");
    }
  }, [orgId]);

  const clearImpersonation = () => setOrgId(null);

  return { orgId, setOrgId, clearImpersonation };
}
