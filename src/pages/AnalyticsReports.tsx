
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { AnalyticsOverview } from "@/components/analytics/AnalyticsOverview";
import { ManagerPerformance } from "@/components/analytics/ManagerPerformance";
import { SentimentAnalysis } from "@/components/analytics/SentimentAnalysis";
import { IssuesAnalysis } from "@/components/analytics/IssuesAnalysis";
import { ReportCreator } from "@/components/analytics/ReportCreator";
import { ReportHistory } from "@/components/analytics/ReportHistory";

const AnalyticsReports = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const handleCreateReportFromData = () => {
    // Switch to Reports tab and Create subtab
    setActiveTab("reports");
    // Focus will be on the Create tab by default
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Аналитика и отчёты
        </h1>
        <p className="text-gray-600">
          Вся статистика, отчёты и экспорт — в одном месте
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="managers">Менеджеры</TabsTrigger>
          <TabsTrigger value="sentiment">Настроения</TabsTrigger>
          <TabsTrigger value="issues">Проблемы</TabsTrigger>
          <TabsTrigger value="reports">Отчёты</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AnalyticsOverview onCreateReport={handleCreateReportFromData} />
        </TabsContent>

        <TabsContent value="managers" className="space-y-6">
          <ManagerPerformance />
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-6">
          <SentimentAnalysis />
        </TabsContent>

        <TabsContent value="issues" className="space-y-6">
          <IssuesAnalysis />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsReports;
