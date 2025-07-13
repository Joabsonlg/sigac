
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Vehicles from "./pages/Vehicles";
import Reservations from "./pages/Reservations";
import Clients from "./pages/Clients";
import Maintenance from "./pages/Maintenance";
import Financial from "./pages/Financial";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import Dashboard from "./pages/Dashboard";

// Auth pages
import AuthLayout from "./pages/auth/AuthLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";

// Auth context
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import DailyRate from "@/pages/DailyRate.tsx";

const queryClient = new QueryClient();

// Protected Routes Component
const AppRoutes = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  const isClient = user?.role?.toLowerCase() === 'client' || user?.role?.toLowerCase() === 'cliente';

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}> 
          <Route path="/login" element={
            isAuthenticated ? (
              isClient ? <Navigate to="/reservas" replace /> : <Navigate to="/" replace />
            ) : <Login />
          } />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/recuperar-senha" element={<ResetPassword />} />
        </Route>

        {/* App Routes - Protected routes that require authentication */}
        <Route path="/" element={
          isAuthenticated ? <Layout /> : <Navigate to="/login" replace />
        }>
          <Route index element={
            isClient ? <Navigate to="/reservas" replace /> : <Dashboard />
          } />
          <Route path="/veiculos" element={<Vehicles />} />
          <Route path="/diarias" element={<DailyRate />} />
          <Route path="/reservas" element={<Reservations />} />
          <Route path="/clientes" element={<Clients />} />
          <Route path="/manutencao" element={<Maintenance />} />
          <Route path="/financeiro" element={<Financial />} />
          <Route path="/relatorios" element={<Reports />} />
          <Route path="/configuracoes" element={<Settings />} />
          <Route path="/usuarios" element={<Users />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
