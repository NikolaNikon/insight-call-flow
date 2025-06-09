
import { useState } from "react";
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { AnalyticsTabsWrapper } from "@/components/analytics/AnalyticsTabsWrapper";

const AnalyticsReports = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const handleCreateReportFromData = () => {
    // Switch to Reports tab and Create subtab
    setActiveTab("reports");
    // Focus will be on the Create tab by default
  };

  return (
    <div className="space-y-6">
      <AnalyticsHeader 
        title="Аналитика и отчёты"
        subtitle="Вся статистика, отчёты и экспорт — в одном месте"
      />

      <AnalyticsTabsWrapper 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreateReport={handleCreateReportFromData}
      />
    </div>
  );
};

export default AnalyticsReports;
