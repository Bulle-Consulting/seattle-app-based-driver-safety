import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface LayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function Layout({ title, subtitle, children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      {/* Mobile overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content">
        <Header title={title} subtitle={subtitle} onMenuToggle={() => setSidebarOpen(prev => !prev)} />
        {children}
      </div>
    </div>
  );
}
