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
          <Route component={NotFound} />
        </Switch>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}
