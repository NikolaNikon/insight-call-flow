
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsHeader } from "@/components/SettingsHeader";
import { UserManagementTab } from "@/components/UserManagementTab";
import { SystemSettingsTab } from "@/components/SystemSettingsTab";
import { SimplifiedIntegrationsTab } from "@/components/SimplifiedIntegrationsTab";
import { SecurityTab } from "@/components/SecurityTab";

const Settings = () => {
  return (
    <div className="space-y-6">
      <SettingsHeader />

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Пользователи</TabsTrigger>
          <TabsTrigger value="system">Система</TabsTrigger>
          <TabsTrigger value="integrations">Интеграции</TabsTrigger>
          <TabsTrigger value="security">Безопасность</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <UserManagementTab />
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <SystemSettingsTab />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <SimplifiedIntegrationsTab />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SecurityTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
