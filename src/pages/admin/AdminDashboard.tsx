
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, 
  Users
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("AdminDashboard: Component mounted");
  }, []);

  const { data: caseCount, isLoading: isLoadingCases } = useQuery({
    queryKey: ["admin-case-count"],
    queryFn: async () => {
      console.log("AdminDashboard: Fetching case count");
      const { count, error } = await supabase
        .from("cases")
        .select("*", { count: "exact", head: true });
      
      if (error) {
        console.error("AdminDashboard: Error fetching case count", error);
        throw error;
      }
      
      console.log("AdminDashboard: Case count fetched successfully", { count });
      return count || 0;
    }
  });

  const { data: userCount, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["admin-user-count"],
    queryFn: async () => {
      console.log("AdminDashboard: Fetching user count");
      const { count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      
      if (error) {
        console.error("AdminDashboard: Error fetching user count", error);
        throw error;
      }
      
      console.log("AdminDashboard: User count fetched successfully", { count });
      return count || 0;
    }
  });

  // Navigation handler with logging
  const handleNavigation = (path: string) => {
    console.log(`AdminDashboard: Navigating to ${path}`);
    navigate(path);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingCases ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <div className="text-3xl font-bold">{caseCount}</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <div className="text-3xl font-bold">{userCount}</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Published Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Coming soon</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Navigation Cards - Removed Dashboard and Settings panels */}
      <h2 className="text-2xl font-semibold mb-4">Admin Navigation</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card 
          className="cursor-pointer hover:bg-gray-700 transition-colors"
          onClick={() => handleNavigation("/admin/cases")}
        >
          <CardHeader>
            <FileText className="h-8 w-8 mb-2" />
            <CardTitle>Cases Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-300">Create, edit, and manage radiology cases</p>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:bg-gray-700 transition-colors"
          onClick={() => handleNavigation("/admin/users")}
        >
          <CardHeader>
            <Users className="h-8 w-8 mb-2" />
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-300">Manage user accounts and permissions</p>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:bg-gray-700 transition-colors"
          onClick={() => {
            console.log("AdminDashboard: Navigating to browse cases (trainee view)");
            navigate("/cases");
          }}
        >
          <CardHeader>
            <FileText className="h-8 w-8 mb-2" />
            <CardTitle>Browse Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-300">View cases as a trainee would see them</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
