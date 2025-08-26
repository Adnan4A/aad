import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/header";
import { MarketWidgetsBanner } from "@/components/market-widgets-banner";
import Dashboard from "@/pages/dashboard";
import Markets from "@/pages/markets";
import Analytics from "@/pages/analytics";
import AuthPage from "@/pages/auth";
import NotFound from "@/pages/not-found";
import Heatmap from "@/pages/heatmap";
import GlobalInsights from "@/pages/global";
import { Profile } from "@/pages/profile";
import { WatchlistPage } from "@/components/watchlist-page";
import News from "@/pages/news";
import AdminDashboard from "@/pages/admin-dashboard";
import { useActivityTracking } from "@/hooks/useActivityTracking";

function Router() {
  // Initialize activity tracking for the entire application
  useActivityTracking();

  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/*">
        <div>
          <Header />
          <div className="pt-16">
            <MarketWidgetsBanner />
          </div>
          <main>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/markets" component={Markets} />
              <Route path="/news" component={News} />
              <Route path="/analytics" component={Analytics} />
              <Route path="/watchlist" component={WatchlistPage} />
              <Route path="/heatmap" component={Heatmap} />
              <Route path="/global" component={GlobalInsights} />
              <Route path="/profile" component={Profile} />
              <Route path="/admin" component={AdminDashboard} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-primary-900 text-white" data-testid="app">
          <Router />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
