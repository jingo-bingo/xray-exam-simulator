
import { ReactNode, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { AppHeader } from "@/components/AppHeader";
import { ArrowLeft, Plus } from "lucide-react";

interface AdminLayoutProps {
  children?: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("AdminLayout: Checking admin access", { userRole });
    if (userRole !== "admin") {
      console.error("AdminLayout: Unauthorized access attempt, redirecting to /unauthorized");
      toast.error("You do not have administrator privileges");
      navigate("/unauthorized");
    }
  }, [userRole, navigate]);

  if (!user) return null;

  // Determine page title and navigation based on current route
  const getPageInfo = () => {
    if (location.pathname.includes('/admin/cases')) {
      return {
        title: "Cases Management",
        navigation: (
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                console.log("AdminLayout: Navigating back to admin dashboard");
                navigate("/admin");
              }}
              className="border-medical-border text-medical-primary hover:bg-medical-lighter"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Button>
            <Button 
              onClick={() => {
                console.log("AdminLayout: Navigating to create case page");
                navigate("/admin/cases/new");
              }} 
              className="bg-medical-primary hover:bg-medical-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Case
            </Button>
          </div>
        )
      };
    }
    
    // Default admin panel
    return {
      title: "Admin Panel",
      navigation: (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            console.log("AdminLayout: Navigating back to main dashboard");
            navigate("/dashboard");
          }}
          className="border-medical-border text-medical-primary hover:bg-medical-lighter"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      )
    };
  };

  const { title, navigation } = getPageInfo();

  return (
    <div className="min-h-screen bg-medical-light text-medical-dark">      
      <AppHeader title={title} navigation={navigation} />
      
      <main className="container mx-auto p-6">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default AdminLayout;
