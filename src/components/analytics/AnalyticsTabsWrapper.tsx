
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsOverview } from "./AnalyticsOverview";
import { ManagerPerformance } from "./ManagerPerformance";
import { SentimentAnalysis } from "./SentimentAnalysis";
import { IssuesAnalysis } from "./IssuesAnalysis";
import { ReportsSection } from "./ReportsSection";

interface AnalyticsTabsWrapperProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  onCreateReport: () => void;
}

export const AnalyticsTabsWrapper = ({ 
  activeTab, 
  onTabChange, 
  onCreateReport 
}: AnalyticsTabsWrapperProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview">Обзор</TabsTrigger>
        <TabsTrigger value="managers">Менеджеры</TabsTrigger>
        <TabsTrigger value="sentiment">Настроения</TabsTrigger>
        <TabsTrigger value="issues">Проблемы</TabsTrigger>
        <TabsTrigger value="reports">Отчёты</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <AnalyticsOverview onCreateReport={onCreateReport} />
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
        <ReportsSection />
      </TabsContent>
    </Tabs>
  );
};
