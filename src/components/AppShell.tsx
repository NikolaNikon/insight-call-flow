
import React, { useState } from "react";
import { AppSidebar } from "./AppSidebar";
import Header from "./Header";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setSidebarCollapsed(!sidebarCollapsed);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={toggleSidebar} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
