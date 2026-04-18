import Layout from "@/components/Layout";

export default function NotFound() {
  return (
    <Layout title="404 — Not Found">
      <div className="main-content items-center justify-center flex flex-1">
        <div className="text-center">
          <div className="text-6xl font-bold text-primary/30 tabular-nums mb-4">404</div>
          <div className="text-sm text-muted-foreground">Page not found</div>
        </div>
      </div>
    </Layout>
  );
}
