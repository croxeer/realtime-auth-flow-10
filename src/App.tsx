import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Feed from "./pages/Feed";
import Groups from "./pages/Groups";
import GroupDetail from "./pages/GroupDetail";
import Profile from "./pages/Profile";
import { CommunityProvider } from "@/contexts/CommunityContext";
import AdminPanel from "./pages/AdminPanel";
import { useIsAdmin } from "@/hooks/use-authz";

const queryClient = new QueryClient();

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Carregando...</div>;
  if (!user) return <Navigate to="/" replace />;
  return children;
};

const RequireAdmin = ({ children }: { children: JSX.Element }) => {
  const isAdmin = useIsAdmin();
  const { isLoading } = useAuth();
  if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Carregando...</div>;
  if (!isAdmin) return <Navigate to="/feed" replace />;
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CommunityProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/feed" element={<RequireAuth><Feed /></RequireAuth>} />
              <Route path="/groups" element={<RequireAuth><Groups /></RequireAuth>} />
              <Route path="/groups/:id" element={<RequireAuth><GroupDetail /></RequireAuth>} />
              <Route path="/profile/:id" element={<RequireAuth><Profile /></RequireAuth>} />
              <Route path="/admin" element={<RequireAuth><RequireAdmin><AdminPanel /></RequireAdmin></RequireAuth>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CommunityProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
