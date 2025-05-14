
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const AdminDashboard = () => {
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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
};

export default AdminDashboard;
