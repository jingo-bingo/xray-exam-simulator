
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
