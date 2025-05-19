
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Database } from "@/integrations/supabase/types";

type RegionType = Database["public"]["Enums"]["region_type"];
type DifficultyLevel = Database["public"]["Enums"]["difficulty_level"];
type CaseAttempt = Database["public"]["Tables"]["case_attempts"]["Row"];

export type Case = {
  id: string;
  title: string;
  description: string;
  region: RegionType;
  age_group: string;
  difficulty: DifficultyLevel;
  is_free_trial: boolean;
};

export const useCasesData = (userId: string | undefined) => {
  const [regionFilter, setRegionFilter] = useState<RegionType | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Fetch cases from the database
  const { 
    data: cases, 
    isLoading: casesLoading, 
    error: casesError 
  } = useQuery({
    queryKey: ["cases", { regionFilter, difficultyFilter }],
    queryFn: async () => {
      console.log("CasesList: Fetching cases with filters:", { regionFilter, difficultyFilter });
      
      let query = supabase
        .from("cases")
        .select("*")
        .eq("published", true);

      if (regionFilter) {
        query = query.eq("region", regionFilter);
      }

      if (difficultyFilter) {
        query = query.eq("difficulty", difficultyFilter);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("CasesList: Error fetching cases:", error.message);
        throw new Error(error.message);
      }
      
      console.log("CasesList: Cases fetched successfully, count:", data?.length);
      return data as Case[];
    },
    enabled: true,
  });

  // Fetch case attempts for the current user from the database
  const { 
    data: attempts, 
    isLoading: attemptsLoading 
  } = useQuery({
    queryKey: ["case-attempts", userId],
    queryFn: async () => {
      if (!userId) return [];

      console.log("CasesList: Fetching case attempts for user:", userId);
      
      const { data, error } = await supabase
        .from("case_attempts")
        .select("*")
        .eq("user_id", userId);
      
      if (error) {
        console.error("CasesList: Error fetching case attempts:", error.message);
        toast({
          title: "Error",
          description: "Failed to load your progress data",
          variant: "destructive",
        });
        return [];
      }
      
      console.log("CasesList: Case attempts fetched successfully, count:", data?.length);
      return data as CaseAttempt[];
    },
    enabled: !!userId,
  });

  // Calculate pagination
  const totalCases = cases?.length || 0;
  const totalPages = Math.ceil(totalCases / ITEMS_PER_PAGE);
  const paginatedCases = cases ? 
    cases.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE) : [];

  // Calculate progress stats from the actual database data
  const attemptedCount = attempts && cases ? 
    cases.filter(c => !!attempts.find(a => a.case_id === c.id)).length : 0;
  const completedCount = attempts && cases ? 
    cases.filter(c => !!attempts.find(a => a.case_id === c.id && a.status === "completed")).length : 0;
  const remainingCount = totalCases - attemptedCount;
  const attemptedPercentage = totalCases > 0 ? Math.round((completedCount / totalCases) * 100) : 0;

  const isLoading = casesLoading || (userId && attemptsLoading);

  // Helper functions
  const getAttemptStatus = (caseId: string): { attempted: boolean; status: string } => {
    if (!attempts || attempts.length === 0) {
      return { attempted: false, status: "Not Attempted" };
    }
    
    const caseAttempt = attempts.find(attempt => attempt.case_id === caseId);
    
    if (!caseAttempt) {
      return { attempted: false, status: "Not Attempted" };
    }
    
    if (caseAttempt.status === "completed") {
      return { attempted: true, status: "Completed" };
    } else {
      return { attempted: true, status: "In Progress" };
    }
  };

  const getRegionDisplayName = (region: string): string => {
    switch (region) {
      case "chest": return "CXR";
      case "abdomen": return "AXR";
      case "head": return "Head";
      case "musculoskeletal": return "MSK";
      case "cardiovascular": return "CV";
      case "neuro": return "Neuro";
      default: return region.charAt(0).toUpperCase() + region.slice(1);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-600";
      case "medium": return "bg-yellow-600";
      case "hard": return "bg-red-600";
      default: return "bg-gray-600";
    }
  };

  const handleRegionChange = (value: string) => {
    console.log("CasesList: Region filter changed to:", value);
    setRegionFilter(value === "all" ? null : value as RegionType);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleDifficultyChange = (value: string) => {
    console.log("CasesList: Difficulty filter changed to:", value);
    setDifficultyFilter(value === "all" ? null : value as DifficultyLevel);
    setCurrentPage(1); // Reset to first page when filtering
  };

  return {
    cases: paginatedCases,
    totalCases,
    currentPage,
    totalPages,
    isLoading,
    casesError,
    attemptedCount,
    remainingCount,
    completedCount,
    attemptedPercentage,
    handleRegionChange,
    handleDifficultyChange,
    getAttemptStatus,
    getRegionDisplayName,
    getDifficultyColor,
    setCurrentPage,
    ITEMS_PER_PAGE
  };
};
