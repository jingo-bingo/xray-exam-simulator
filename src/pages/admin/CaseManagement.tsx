
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { useCaseManagement } from "@/hooks/admin/useCaseManagement";
import { CaseFilters } from "@/components/admin/CaseFilters";
import { CasesManagementTable } from "@/components/admin/CasesManagementTable";

const CaseManagement = () => {
  const navigate = useNavigate();
  const {
    cases,
    isLoading,
    error,
    filter,
    setFilter,
    handleDeleteCase,
    getCreatorName
  } = useCaseManagement();
  
  useEffect(() => {
    console.log("CaseManagement: Component mounted with filter:", filter);
  }, [filter]);
  
  const handleCreateCase = () => {
    console.log("CaseManagement: Navigating to create case page");
    navigate("/admin/cases/new");
  };
  
  const handleEditCase = (id: string) => {
    console.log("CaseManagement: Navigating to edit case page", { id });
    navigate(`/admin/cases/edit/${id}`);
  };
  
  if (error) {
    console.error("CaseManagement: Error in component", error);
    return <div className="text-red-500">Error loading cases: {(error as Error).message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              console.log("CaseManagement: Navigating back to admin dashboard");
              navigate("/admin");
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Cases Management</h1>
        </div>
        <Button onClick={handleCreateCase}>
          <Plus className="mr-2 h-4 w-4" />
          Create Case
        </Button>
      </div>
      
      <CaseFilters filter={filter} onFilterChange={setFilter} />
      
      {isLoading ? (
        <div>Loading cases...</div>
      ) : (
        <CasesManagementTable 
          cases={cases || []}
          getCreatorName={getCreatorName}
          onEdit={handleEditCase}
          onDelete={handleDeleteCase}
        />
      )}
    </div>
  );
};

export default CaseManagement;
