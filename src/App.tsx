import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Produtos from "./pages/Produtos";
import Propostas from "./pages/Propostas";
import PropostaEditor from "./pages/PropostaEditor";
import Usuarios from "./pages/Usuarios";
import Configuracoes from "./pages/Configuracoes";
import Templates from "./pages/Templates";
import Catalogos from "./pages/Catalogos";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/produtos"
              element={
                <ProtectedRoute>
                  <Produtos />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/propostas"
              element={
                <ProtectedRoute>
                  <Propostas />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/propostas/:id/editar"
              element={
                <ProtectedRoute>
                  <PropostaEditor />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Usuarios />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/configuracoes"
              element={
                <ProtectedRoute>
                  <Configuracoes />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/templates"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Templates />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/catalogos"
              element={
                <ProtectedRoute>
                  <Catalogos />
                </ProtectedRoute>
              }
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
