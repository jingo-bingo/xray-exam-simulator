
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface CaseAttemptState {
  attemptId: string | null;
  status: 'not_started' | 'in_progress' | 'completed';
  isLoading: boolean;
  error: Error | null;
}

export function useCaseAttempt(caseId: string | undefined, userId: string | undefined) {
  const [state, setState] = useState<CaseAttemptState>({
    attemptId: null,
    status: 'not_started',
    isLoading: false,
    error: null
  });

  // Fetch existing attempt for this case and user
  const { refetch: refetchAttempt } = useQuery({
    queryKey: ['case-attempt', caseId, userId],
    queryFn: async () => {
      if (!caseId || !userId) return null;

      console.log("useCaseAttempt: Fetching attempt for case:", caseId, "and user:", userId);
      setState(prev => ({ ...prev, isLoading: true }));
      
      try {
        const { data, error } = await supabase
          .from("case_attempts")
          .select("*")
          .eq("case_id", caseId)
          .eq("user_id", userId)
          .order("started_at", { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          console.log("useCaseAttempt: Found existing attempt:", data);
          setState({
            attemptId: data.id,
            // Here's the fix - ensure we only use allowed status values
            status: data.status === 'in_progress' || data.status === 'completed' ? data.status : 'in_progress',
            isLoading: false,
            error: null
          });
          return data;
        } else {
          console.log("useCaseAttempt: No existing attempt found");
          setState({
            attemptId: null,
            status: 'not_started',
            isLoading: false,
            error: null
          });
          return null;
        }
      } catch (error) {
        console.error("useCaseAttempt: Error fetching attempt:", error);
        setState({
          attemptId: null,
          status: 'not_started',
          isLoading: false,
          error: error as Error
        });
        return null;
      }
    },
    enabled: !!caseId && !!userId,
  });

  // Create new attempt mutation
  const createAttemptMutation = useMutation({
    mutationFn: async () => {
      if (!caseId || !userId) {
        throw new Error("Cannot create attempt: Missing case ID or user ID");
      }

      console.log("useCaseAttempt: Creating new attempt for case:", caseId);
      setState(prev => ({ ...prev, isLoading: true }));
      
      const { data, error } = await supabase
        .from("case_attempts")
        .insert({
          case_id: caseId,
          user_id: userId,
          status: 'in_progress'
        })
        .select()
        .single();
        
      if (error) {
        console.error("useCaseAttempt: Error creating attempt:", error);
        setState(prev => ({ ...prev, isLoading: false, error }));
        throw error;
      }
      
      console.log("useCaseAttempt: New attempt created:", data);
      setState({
        attemptId: data.id,
        status: 'in_progress',
        isLoading: false,
        error: null
      });
      
      return data;
    }
  });

  const startCase = async () => {
    try {
      await createAttemptMutation.mutateAsync();
      toast({
        title: "Case started",
        description: "Good luck with your answers!",
      });
    } catch (error) {
      toast({
        title: "Failed to start case",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleComplete = () => {
    setState(prev => ({ ...prev, status: 'completed' }));
    refetchAttempt();
  };

  return {
    ...state,
    startCase,
    handleComplete,
    isCreating: createAttemptMutation.isPending
  };
}
