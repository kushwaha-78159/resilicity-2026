import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { LogIn } from "lucide-react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

function ProtectedWorkspace() {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#f5f8f5] text-[#58766a]">Checking planner access…</div>;
  if (!user) return <div className="flex min-h-screen items-center justify-center bg-[#f5f8f5] p-6"><div className="max-w-sm rounded-3xl bg-white p-8 text-center shadow-xl"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#183b31] text-white"><LogIn className="h-5 w-5" /></div><h1 className="mt-5 font-display text-2xl font-semibold text-[#17322b]">Planner access required</h1><p className="mt-2 text-sm leading-relaxed text-[#71847b]">Scenario lab and event history are protected for authenticated planning teams.</p><Button onClick={() => startLogin()} className="mt-6 rounded-xl bg-[#183b31]">Sign in to continue</Button></div></div>;
  return <Home />;
}

function Router() {
  return <Switch><Route path="/" component={Home} /><Route path="/scenario-lab" component={ProtectedWorkspace} /><Route path="/history" component={ProtectedWorkspace} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>;
}

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
