
import { Navigate, Outlet } from "react-router-dom";
import { useAuth, UserRole } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  requiredRole?: UserRole;
}

const ProtectedRoute = ({ requiredRole }: ProtectedRouteProps) => {
  const { user, userRole, isLoading } = useAuth();

  if (isLoading) {
    console.log("ProtectedRoute: Loading authentication state");
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  console.log("ProtectedRoute: Checking authorization", { 
    isAuthenticated: !!user, 
    requiredRole, 
    userRole,
    isAdmin: userRole === 'admin',
    canAccess: !requiredRole || userRole === requiredRole || (userRole === 'admin' && requiredRole === 'trainee')
  });

  if (!user) {
    console.log("ProtectedRoute: User not authenticated, redirecting to /auth");
    return <Navigate to="/auth" replace />;
  }

  // Allow admins to access trainee routes, but not vice versa
  if (requiredRole && userRole !== requiredRole) {
    // Special case: Admin can access trainee routes
    if (userRole === 'admin' && requiredRole === 'trainee') {
      console.log("ProtectedRoute: Admin accessing trainee route, allowing access");
      return <Outlet />;
    }
    
    console.log("ProtectedRoute: Insufficient permissions, redirecting to /unauthorized");
    return <Navigate to="/unauthorized" replace />;
  }

  console.log("ProtectedRoute: Access granted");
  return <Outlet />;
};

export default ProtectedRoute;
