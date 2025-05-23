
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "@/components/ui/sonner";

type BaseCase = Database["public"]["Tables"]["cases"]["Row"];

type Case = BaseCase & {
  creator?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
};

export const useCaseManagement = () => {
  const [filter, setFilter] = useState("all");
  
  const { data: cases, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-cases", filter],
    queryFn: async () => {
      console.log("CaseManagement: Fetching cases with filter:", filter);
      
      let query = supabase
        .from("cases")
        .select("*");
      
      if (filter === "published") {
        query = query.eq("published", true);
      } else if (filter === "unpublished") {
        query = query.eq("published", false);
      }
      
      const { data: casesData, error: casesError } = await query.order("created_at", { ascending: false });
      
      if (casesError) {
        console.error("CaseManagement: Error fetching cases", casesError);
        throw casesError;
      }
      
      console.log("CaseManagement: Cases fetched successfully", { count: casesData?.length });
      
      // Fetch creator profiles separately for cases that have created_by
      const casesWithCreatedBy = casesData?.filter(c => c.created_by) || [];
      const creatorIds = [...new Set(casesWithCreatedBy.map(c => c.created_by))];
      
      let profilesData: any[] = [];
      if (creatorIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", creatorIds);
        
        if (!profilesError && profiles) {
          profilesData = profiles;
        }
      }
      
      // Map cases with their creator information
      const casesWithCreators = casesData?.map(caseItem => ({
        ...caseItem,
        creator: caseItem.created_by 
          ? profilesData.find(p => p.id === caseItem.created_by) || null
          : null
      })) || [];
      
      return casesWithCreators as Case[];
    }
  });

  const handleDeleteCase = async (id: string) => {
    console.log("CaseManagement: Attempting to delete case", { id });
    
    if (!window.confirm("Are you sure you want to delete this case?")) {
      console.log("CaseManagement: Delete cancelled by user");
      return;
    }
    
    try {
      const { error } = await supabase
        .from("cases")
        .delete()
        .eq("id", id);
      
      if (error) {
        console.error("CaseManagement: Error deleting case", error);
        toast.error("Failed to delete case: " + error.message);
        return;
      }
      
      console.log("CaseManagement: Case deleted successfully", { id });
      toast.success("Case deleted successfully");
      refetch();
    } catch (error) {
      console.error("CaseManagement: Unexpected error during delete", error);
      toast.error("An unexpected error occurred");
    }
  };

  const getCreatorName = (creator: Case["creator"]) => {
    if (!creator) return "System";
    
    const { first_name, last_name } = creator;
    if (first_name && last_name) {
      return `${first_name} ${last_name}`;
    }
    if (first_name) return first_name;
    if (last_name) return last_name;
    return "Unknown";
  };

  return {
    cases,
    isLoading,
    error,
    filter,
    setFilter,
    handleDeleteCase,
    getCreatorName
  };
};

export type { Case };
