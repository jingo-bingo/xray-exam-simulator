
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CaseForm } from "@/components/admin/CaseForm";
import { StandardizedQuestionDisplay } from "@/components/admin/StandardizedQuestionDisplay";
import { useCaseEditor } from "@/hooks/useCaseEditor";
import { memo, useCallback, useEffect } from "react";
import { ScanManager, type CaseScan } from "@/components/admin/ScanManager";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";

const CaseEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  console.log("CaseEditor: Component mounted, id:", id);
  
  const {
    caseData,
    isLoadingCase,
    isNewCase,
    isPendingSave,
    handleInputChange,
    handleDicomUpload,
    setScansForSubmission,
    submitCase
  } = useCaseEditor(id, navigate);

  // Create a form instance to manage the model_answer field
  const form = useForm({
    defaultValues: {
      model_answer: caseData.model_answer || ""
    }
  });

  // Update form when caseData changes
  useEffect(() => {
    form.setValue("model_answer", caseData.model_answer || "");
  }, [caseData.model_answer, form]);

  // Fetch scans whenever caseId changes
  useEffect(() => {
    const fetchScans = async () => {
      if (!id || id === 'new') return;
      
      try {
        const { data } = await supabase
          .from('case_scans')
          .select('*')
          .eq('case_id', id)
          .order('display_order', { ascending: true });
          
        if (data && data.length > 0) {
          // Pass scans to editor hook for saving later
          setScansForSubmission(data);
        }
      } catch (error) {
        console.error("CaseEditor: Error fetching scans", error);
      }
    };
    
    fetchScans();
  }, [id, setScansForSubmission]);
  
  // Use useCallback to stabilize these functions
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Get the current model_answer from the form
    const modelAnswer = form.getValues("model_answer");
    
    // Update the case data with the model answer and submit
    const updatedCaseData = {
      ...caseData,
      model_answer: modelAnswer
    };
    
    submitCase(updatedCaseData);
  }, [caseData, form, submitCase]);
  
  const handleCancel = useCallback(() => {
    console.log("CaseEditor: Cancel clicked, navigating back to case management");
    navigate("/admin/cases");
  }, [navigate]);

  const handleModelAnswerChange = useCallback((value: string) => {
    form.setValue("model_answer", value);
    handleInputChange("model_answer", value);
  }, [form, handleInputChange]);
  
  if (!isNewCase && isLoadingCase) {
    return <div>Loading case...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {isNewCase ? "Create New Case" : "Edit Case"}
        </h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <CaseForm 
          caseData={caseData}
          isNewCase={isNewCase}
          onInputChange={handleInputChange}
          onDicomUpload={handleDicomUpload}
        />
        
        <Form {...form}>
          <StandardizedQuestionDisplay 
            control={{
              ...form.control,
              _formValues: form.watch(),
              _fields: {
                model_answer: {
                  _f: {
                    name: "model_answer",
                    value: form.watch("model_answer"),
                    onChange: (e: any) => handleModelAnswerChange(e.target.value)
                  }
                }
              }
            } as any}
          />
        </Form>
        
        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isPendingSave}
          >
            {isPendingSave ? "Saving..." : (isNewCase ? "Create Case" : "Update Case")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CaseEditor;
