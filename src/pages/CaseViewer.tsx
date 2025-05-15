
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DicomViewer } from "@/components/admin/DicomViewer";
import { CaseViewerToolbar } from "@/components/case-viewer/CaseViewerToolbar";
import { ClinicalHistoryPanel } from "@/components/case-viewer/ClinicalHistoryPanel";
import { QuestionPanel } from "@/components/case-viewer/QuestionPanel";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Database } from "@/integrations/supabase/types";

type Case = Database["public"]["Tables"]["cases"]["Row"];
type Question = Database["public"]["Tables"]["questions"]["Row"];

const CaseViewer = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [dicomUrl, setDicomUrl] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string>("pan");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [caseAttemptId, setCaseAttemptId] = useState<string | null>(null);

  console.log(`CaseViewer: Initializing for case ${caseId}`);

  // Fetch the case details
  const { data: caseData, isLoading, error } = useQuery({
    queryKey: ["case", caseId],
    queryFn: async () => {
      console.log(`CaseViewer: Fetching case data for ${caseId}`);
      
      if (!caseId) {
        throw new Error("Case ID is missing");
      }
      
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("id", caseId)
        .eq("published", true)
        .single();
      
      if (error) {
        console.error("CaseViewer: Error fetching case data:", error);
        throw error;
      }
      
      console.log(`CaseViewer: Case data fetched successfully:`, data);
      return data as Case;
    },
    enabled: !!caseId,
  });

  // Fetch the questions for this case
  const { data: questionData, isLoading: questionsLoading } = useQuery({
    queryKey: ["questions", caseId],
    queryFn: async () => {
      console.log(`CaseViewer: Fetching questions for case ${caseId}`);
      
      if (!caseId) {
        throw new Error("Case ID is missing");
      }
      
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("case_id", caseId)
        .order("display_order", { ascending: true });
      
      if (error) {
        console.error("CaseViewer: Error fetching questions:", error);
        throw error;
      }
      
      console.log(`CaseViewer: ${data.length} questions fetched successfully`);
      return data as Question[];
    },
    enabled: !!caseId,
  });

  // Create or get a case attempt
  const createCaseAttempt = useMutation({
    mutationFn: async () => {
      if (!user || !caseId) return null;
      
      console.log(`CaseViewer: Creating case attempt for user ${user.id} and case ${caseId}`);
      
      // Check if there's an existing in-progress attempt
      const { data: existingAttempt, error: fetchError } = await supabase
        .from("case_attempts")
        .select("*")
        .eq("user_id", user.id)
        .eq("case_id", caseId)
        .eq("status", "in_progress")
        .maybeSingle();
      
      if (fetchError) {
        console.error("CaseViewer: Error checking for existing attempts:", fetchError);
        throw fetchError;
      }
      
      if (existingAttempt) {
        console.log(`CaseViewer: Found existing attempt:`, existingAttempt);
        return existingAttempt;
      }
      
      // Create a new attempt
      const { data: newAttempt, error: insertError } = await supabase
        .from("case_attempts")
        .insert({
          user_id: user.id,
          case_id: caseId,
          status: "in_progress",
        })
        .select()
        .single();
      
      if (insertError) {
        console.error("CaseViewer: Error creating case attempt:", insertError);
        throw insertError;
      }
      
      console.log(`CaseViewer: Created new case attempt:`, newAttempt);
      return newAttempt;
    },
    onSuccess: (data) => {
      if (data) {
        setCaseAttemptId(data.id);
      }
    },
    onError: (error) => {
      console.error("CaseViewer: Error in createCaseAttempt mutation:", error);
      toast({
        title: "Error",
        description: "Failed to start case attempt. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Effect to get the DICOM URL when the case data is loaded
  useEffect(() => {
    if (caseData?.dicom_path) {
      console.log(`CaseViewer: Getting download URL for DICOM ${caseData.dicom_path}`);
      
      const getDownloadUrl = async () => {
        try {
          const { data, error } = await supabase.storage
            .from("dicom_images")
            .createSignedUrl(caseData.dicom_path, 3600); // 1 hour expiry
          
          if (error) {
            console.error("CaseViewer: Error getting signed URL:", error);
            toast({
              title: "Error",
              description: "Failed to load image. Please try again.",
              variant: "destructive",
            });
            return;
          }
          
          console.log(`CaseViewer: Got signed URL for DICOM image`);
          setDicomUrl(data.signedUrl);
        } catch (error) {
          console.error("CaseViewer: Exception getting signed URL:", error);
        }
      };
      
      getDownloadUrl();
    }
  }, [caseData]);

  // Effect to set questions when the data is loaded
  useEffect(() => {
    if (questionData) {
      console.log(`CaseViewer: Setting ${questionData.length} questions`);
      setQuestions(questionData);
    }
  }, [questionData]);

  // Create a case attempt when the component loads
  useEffect(() => {
    if (user && caseId && !caseAttemptId) {
      console.log(`CaseViewer: Initializing case attempt for user ${user.id}`);
      createCaseAttempt.mutate();
    }
  }, [user, caseId]);

  const handleToolChange = (tool: string) => {
    console.log(`CaseViewer: Tool changed to ${tool}`);
    setActiveTool(tool);
    // In a real implementation, this would communicate with the DicomViewer
  };

  const handleViewReset = () => {
    console.log(`CaseViewer: View reset requested`);
    // In a real implementation, this would reset the DicomViewer
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      console.log(`CaseViewer: Moving to next question, index ${currentQuestionIndex + 1}`);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      console.log(`CaseViewer: All questions completed`);
      // All questions completed, navigate back to cases list
      toast({
        title: "Case completed",
        description: "You have completed all questions for this case.",
      });
      navigate("/cases");
    }
  };

  if (isLoading || questionsLoading) {
    return (
      <div className="min-h-screen bg-radiology-dark text-radiology-light flex items-center justify-center">
        <p>Loading case...</p>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen bg-radiology-dark text-radiology-light flex flex-col items-center justify-center gap-4">
        <p>Failed to load case. The case may not exist or you may not have access to it.</p>
        <Button variant="outline" onClick={() => navigate("/cases")}>
          Return to Cases
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-radiology-dark text-radiology-light">
      <header className="bg-gray-800 shadow-md py-4 px-6">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">{caseData.title}</h1>
          <p className="text-gray-400">
            {caseData.region.charAt(0).toUpperCase() + caseData.region.slice(1)} - 
            {caseData.age_group.charAt(0).toUpperCase() + caseData.age_group.slice(1)}
          </p>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* DICOM Viewer Section - Takes up 2/3 of the screen on large displays */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-gray-900 rounded-md overflow-hidden shadow-lg">
              <CaseViewerToolbar 
                onToolChange={handleToolChange} 
                onReset={handleViewReset} 
                activeTool={activeTool} 
              />
              <div className="bg-black aspect-square lg:aspect-video w-full overflow-hidden relative">
                {dicomUrl ? (
                  <DicomViewer 
                    imageUrl={dicomUrl} 
                    alt={`Case ${caseData.case_number}`} 
                    className="w-full h-full" 
                    onError={(error) => {
                      console.error("CaseViewer: DicomViewer error:", error);
                      toast({
                        title: "Image Error",
                        description: "Failed to load the image. Please try again.",
                        variant: "destructive",
                      });
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Loading image...</p>
                  </div>
                )}
              </div>
            </div>
            
            <ClinicalHistoryPanel clinicalHistory={caseData.clinical_history} />
          </div>

          {/* Questions Section - Takes up 1/3 of the screen on large displays */}
          <div className="space-y-4">
            {questions.length > 0 ? (
              <>
                <h2 className="text-xl font-semibold mb-2">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </h2>
                {user && caseAttemptId && (
                  <QuestionPanel
                    question={questions[currentQuestionIndex]}
                    userId={user.id}
                    caseId={caseId!}
                    caseAttemptId={caseAttemptId}
                    onNext={handleNextQuestion}
                    isLastQuestion={currentQuestionIndex === questions.length - 1}
                  />
                )}
              </>
            ) : (
              <div className="bg-gray-800 p-6 rounded-md text-center">
                <p className="text-gray-400">
                  No questions available for this case.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CaseViewer;
