import Sidebar from "@/components/Sidebar";

export default function NotFound() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content items-center justify-center flex">
        <div className="text-center">
          <div className="text-6xl font-bold text-primary/30 tabular-nums mb-4">404</div>
          <div className="text-sm text-muted-foreground">Page not found</div>
        </div>
      </div>
    </div>
  );
}
