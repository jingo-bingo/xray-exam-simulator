
import { useAuth } from "@/hooks/useAuth";
import { useCasesData } from "@/hooks/useCasesData";
import { CaseFilters } from "@/components/cases/CaseFilters";
import { CasesTable } from "@/components/cases/CasesTable";
import { CasesPagination } from "@/components/cases/CasesPagination";
import { CaseProgressCards } from "@/components/cases/CaseProgressCards";

const CasesList = () => {
  const { user } = useAuth();
  
  const {
    cases,
    currentPage,
    totalPages,
    isLoading,
    casesError,
    attemptedCount,
    remainingCount,
    completedCount,
    attemptedPercentage,
    totalCases,
    handleRegionChange,
    handleDifficultyChange,
    getAttemptStatus,
    getRegionDisplayName,
    getDifficultyColor,
    setCurrentPage,
    ITEMS_PER_PAGE
  } = useCasesData(user?.id);

  if (isLoading) return <div className="text-center p-8">Loading cases...</div>;
  if (casesError) return <div className="text-center p-8 text-red-500">Error loading cases: {(casesError as Error).message}</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold text-radiology-light">Available Cases</h2>
        <CaseFilters 
          onRegionChange={handleRegionChange}
          onDifficultyChange={handleDifficultyChange}
        />
      </div>

      <CasesTable
        cases={cases}
        currentPage={currentPage}
        itemsPerPage={ITEMS_PER_PAGE}
        getRegionDisplayName={getRegionDisplayName}
        getDifficultyColor={getDifficultyColor}
        getAttemptStatus={getAttemptStatus}
      />
      
      <CasesPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
      
      <CaseProgressCards
        attemptedCount={attemptedCount}
        remainingCount={remainingCount}
        completedCount={completedCount}
        attemptedPercentage={attemptedPercentage}
        totalCases={totalCases}
      />
    </div>
  );
};

export default CasesList;
