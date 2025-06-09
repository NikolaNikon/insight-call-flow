
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportCreator } from "./ReportCreator";
import { ReportHistory } from "./ReportHistory";

export const ReportsSection = () => {
  return (
    <Tabs defaultValue="create" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="create">Создать</TabsTrigger>
        <TabsTrigger value="history">История</TabsTrigger>
      </TabsList>

      <TabsContent value="create" className="space-y-6">
        <ReportCreator />
      </TabsContent>

      <TabsContent value="history" className="space-y-6">
        <ReportHistory />
      </TabsContent>
    </Tabs>
  );
};
