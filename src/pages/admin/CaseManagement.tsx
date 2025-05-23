
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { useCaseManagement } from "@/hooks/admin/useCaseManagement";
import { CaseFilters } from "@/components/admin/CaseFilters";
import { CasesManagementTable } from "@/components/admin/CasesManagementTable";
import { AppHeader } from "@/components/AppHeader";

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

  const navigation = (
    <div className="flex items-center gap-4">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => {
          console.log("CaseManagement: Navigating back to admin dashboard");
          navigate("/admin");
        }}
        className="border-medical-border text-medical-primary hover:bg-medical-lighter"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Admin
      </Button>
      <Button onClick={handleCreateCase} className="bg-medical-primary hover:bg-medical-primary/90">
        <Plus className="mr-2 h-4 w-4" />
        Create Case
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-medical-light text-medical-dark">
      <AppHeader title="Cases Management" navigation={navigation} />
      
      <main className="container mx-auto p-6">
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
      </main>
    </div>
  );
};

export default CaseManagement;
