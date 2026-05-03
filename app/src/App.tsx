import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import TwinsGallery from "@/pages/twins";
import Scorer from "@/pages/scorer";
import RoiSimulator from "@/pages/roi";
import Architecture from "@/pages/architecture";
import Intake from "@/pages/intake";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/twins" component={TwinsGallery} />
        <Route path="/scorer" component={Scorer} />
        <Route path="/roi" component={RoiSimulator} />
        <Route path="/architecture" component={Architecture} />
        <Route path="/intake" component={Intake} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
