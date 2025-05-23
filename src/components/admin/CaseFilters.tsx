
import { Button } from "@/components/ui/button";

interface CaseFiltersProps {
  filter: string;
  onFilterChange: (filter: string) => void;
}

export const CaseFilters = ({ filter, onFilterChange }: CaseFiltersProps) => {
  return (
    <div className="flex gap-2 mb-4">
      <Button 
        variant={filter === "all" ? "default" : "outline"} 
        onClick={() => onFilterChange("all")}
      >
        All
      </Button>
      <Button 
        variant={filter === "published" ? "default" : "outline"} 
        onClick={() => onFilterChange("published")}
      >
        Published
      </Button>
      <Button 
        variant={filter === "unpublished" ? "default" : "outline"} 
        onClick={() => onFilterChange("unpublished")}
      >
        Unpublished
      </Button>
    </div>
  );
};
