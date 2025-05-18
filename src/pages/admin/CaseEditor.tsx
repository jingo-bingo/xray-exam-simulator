
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CaseForm } from "@/components/admin/CaseForm";
import { QuestionsSection } from "@/components/admin/QuestionsSection";
import { useCaseEditor } from "@/hooks/useCaseEditor";
import { memo, useCallback } from "react";

// Memoize both main components to prevent re-renders
const MemoizedQuestionsSection = memo(QuestionsSection);
// CaseForm is already memoized in its own file

const CaseEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  console.log("CaseEditor: Component mounted, id:", id);
  
  const {
    caseData,
    questions,
    isLoadingCase,
    isNewCase,
    isPendingSave,
    handleInputChange,
    handleDicomUpload,
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    submitCase
  } = useCaseEditor(id, navigate);
  
  // Use useCallback to stabilize these functions
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    submitCase();
  }, [submitCase]);
  
  const handleCancel = useCallback(() => {
    console.log("CaseEditor: Cancel clicked, navigating back to case management");
    navigate("/admin/cases");
  }, [navigate]);
  
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
        
        <MemoizedQuestionsSection 
          questions={questions}
          onUpdateQuestion={handleUpdateQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          onAddQuestion={handleAddQuestion}
        />
        
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
