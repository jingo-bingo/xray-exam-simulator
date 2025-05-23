
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Billing from "./pages/Billing";
import Unauthorized from "./pages/Unauthorized";
import Cases from "./pages/Cases";
import CaseView from "./pages/CaseView";
import SubmitCases from "./pages/SubmitCases";
import SubmitNewCase from "./pages/SubmitNewCase";
import ExamHolding from "./pages/ExamHolding";
import ExamSession from "./pages/ExamSession";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";

// Admin pages
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CaseManagement from "./pages/admin/CaseManagement";
import CaseEditor from "./pages/admin/CaseEditor";
import UserManagement from "./pages/admin/UserManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected routes - accessible by all authenticated users */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/exam/holding" element={<ExamHolding />} />
              <Route path="/exam/session" element={<ExamSession />} />
              {/* Both admins and trainees can access cases */}
              <Route path="/cases" element={<Cases />} />
              <Route path="/cases/:id" element={<CaseView />} />
            </Route>
            
            {/* Contributor routes - accessible by contributors and admins */}
            <Route element={<ProtectedRoute requiredRole="contributor" />}>
              <Route path="/cases/submit" element={<SubmitCases />} />
              <Route path="/cases/submit/new" element={<SubmitNewCase />} />
            </Route>
            
            {/* Admin routes - strictly admin only */}
            <Route element={<ProtectedRoute requiredRole="admin" />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="cases" element={<CaseManagement />} />
                <Route path="cases/new" element={<CaseEditor />} />
                <Route path="cases/edit/:id" element={<CaseEditor />} />
                <Route path="users" element={<UserManagement />} />
              </Route>
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
