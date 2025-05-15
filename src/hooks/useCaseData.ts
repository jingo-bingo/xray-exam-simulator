
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const useCaseData = (id: string | undefined, userId: string | null) => {
  return useQuery({
    queryKey: ["case", id],
    queryFn: async () => {
      if (!id) throw new Error("Case ID is required");
      
      console.log("useCaseData: Fetching case with id:", id);
      const { data: caseData, error: caseError } = await supabase
        .from("cases")
        .select("*")
        .eq("id", id)
        .single();

      if (caseError) {
        console.error("useCaseData: Error fetching case:", caseError);
        throw new Error(caseError.message);
      }

      return caseData;
    },
    enabled: !!id && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once to avoid excessive retries on 404s
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: `Failed to load case: ${error.message}`,
          variant: "destructive",
        });
      }
    }
  });
};
