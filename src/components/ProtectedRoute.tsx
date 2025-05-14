
import { Navigate, Outlet } from "react-router-dom";
import { useAuth, UserRole } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  requiredRole?: UserRole;
}

const ProtectedRoute = ({ requiredRole }: ProtectedRouteProps) => {
  const { user, userRole, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
