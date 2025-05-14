
import { ReactNode, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "./SidebarNav";
import { toast } from "@/components/ui/sonner";

interface AdminLayoutProps {
  children?: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("AdminLayout: Checking admin access", { userRole });
    if (userRole !== "admin") {
      console.error("AdminLayout: Unauthorized access attempt, redirecting to /unauthorized");
      toast.error("You do not have administrator privileges");
      navigate("/unauthorized");
    }
  }, [userRole, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-radiology-dark text-radiology-light flex">
      <SidebarNav />
      
      <div className="flex-1">
        <header className="bg-gray-800 shadow-md py-4 px-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <span>{user.email}</span>
            <Button variant="outline" onClick={signOut}>Sign Out</Button>
          </div>
        </header>
        
        <main className="p-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
