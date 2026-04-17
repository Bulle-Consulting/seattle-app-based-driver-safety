import { Router, Route, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "./pages/Dashboard";
import MapPage from "./pages/MapPage";
import IncidentsPage from "./pages/IncidentsPage";
import LiveFeed from "./pages/LiveFeed";
import WorkerRightsPage from "./pages/WorkerRightsPage";
import ResourcesPage from "./pages/ResourcesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import PayCalculatorPage from "./pages/PayCalculatorPage";
import SubmitIncidentPage from "./pages/SubmitIncidentPage";
import AlertsPage from "./pages/AlertsPage";
import ApiDocsPage from "./pages/ApiDocsPage";
import NotFound from "./pages/not-found";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router hook={useHashLocation}>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/map" component={MapPage} />
          <Route path="/incidents" component={IncidentsPage} />
          <Route path="/live" component={LiveFeed} />
          <Route path="/worker-rights" component={WorkerRightsPage} />
          <Route path="/resources" component={ResourcesPage} />
          <Route path="/analytics" component={AnalyticsPage} />
          <Route path="/tools" component={PayCalculatorPage} />
          <Route path="/submit" component={SubmitIncidentPage} />
          <Route path="/alerts" component={AlertsPage} />
          <Route path="/api-docs" component={ApiDocsPage} />
          <Route component={NotFound} />
        </Switch>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}
