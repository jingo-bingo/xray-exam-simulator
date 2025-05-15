
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCase = (id: string | undefined, userId: string | undefined) => {
  return useQuery({
    queryKey: ["case", id],
    queryFn: async () => {
      console.log("CaseView: Fetching case with id:", id);
      const { data: caseData, error: caseError } = await supabase
        .from("cases")
        .select("*")
        .eq("id", id)
        .single();

      if (caseError) {
        console.error("CaseView: Error fetching case:", caseError);
        throw new Error(caseError.message);
      }

      return caseData;
    },
    enabled: !!id && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once to avoid excessive retries on 404s
  });
};

