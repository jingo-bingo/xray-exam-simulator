
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/hooks/useAuth";
import { UserWithRole } from "@/components/admin/users/UsersTable";
import { useState, useEffect } from "react";

export const useUserManagement = () => {
  const [filter, setFilter] = useState<UserRole | "all">("all");
  
  useEffect(() => {
    console.log("useUserManagement: Filter changed to:", filter);
  }, [filter]);
  
  const { data: users, isLoading, error } = useQuery({
    queryKey: ["admin-users", filter],
    queryFn: async () => {
      console.log("useUserManagement: Fetching users with filter:", filter);
      
      try {
        // Call our Edge Function instead of direct admin API
        const { data, error } = await supabase.functions.invoke("list-users", {
          body: { filter }
        });
        
        if (error) {
          console.error("useUserManagement: Error invoking list-users function", error);
          throw error;
        }
        
        if (!data?.data) {
          console.warn("useUserManagement: No users returned from function");
          return [];
        }
        
        console.log("useUserManagement: Users fetched successfully via function", { 
          count: data.data.length 
        });
        
        return data.data as UserWithRole[];
      } catch (err) {
        console.error("useUserManagement: Error in query function", err);
        throw new Error(err instanceof Error ? err.message : "Failed to fetch users");
      }
    }
  });

  return {
    users,
    isLoading,
    error,
    filter,
    setFilter
  };
};
