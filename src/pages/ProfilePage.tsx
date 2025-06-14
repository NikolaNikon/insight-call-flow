
import React, { Suspense } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ProfileBasics from "../components/profile/ProfileBasics";
import ProfileConnections from "../components/profile/ProfileConnections";
import ProfileNotifications from "../components/profile/ProfileNotifications";
import ProfilePersonalization from "../components/profile/ProfilePersonalization";
import ProfileSecurity from "../components/profile/ProfileSecurity";

const ProfilePage = () => {
  return (
    <div className="max-w-3xl mx-auto mt-8 mb-10">
      <h1 className="text-2xl font-bold mb-4">👤 Мой профиль</h1>
      <Tabs defaultValue="basics" className="w-full">
        <TabsList className="mb-6 grid grid-cols-5 gap-2">
          <TabsTrigger value="basics">Основное</TabsTrigger>
          <TabsTrigger value="connections">Подключения</TabsTrigger>
          <TabsTrigger value="notifications">Уведомления</TabsTrigger>
          <TabsTrigger value="personal">Персонализация</TabsTrigger>
          <TabsTrigger value="security">Безопасность</TabsTrigger>
        </TabsList>

        <TabsContent value="basics">
          <ProfileBasics />
        </TabsContent>
        <TabsContent value="connections">
          <ProfileConnections />
        </TabsContent>
        <TabsContent value="notifications">
          <ProfileNotifications />
        </TabsContent>
        <TabsContent value="personal">
          <ProfilePersonalization />
        </TabsContent>
        <TabsContent value="security">
          <ProfileSecurity />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
