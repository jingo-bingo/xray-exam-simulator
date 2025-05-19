
import { Button } from "@/components/ui/button";
import { UserRole } from "@/hooks/useAuth";

interface UserFiltersProps {
  activeFilter: UserRole | "all";
  onFilterChange: (filter: UserRole | "all") => void;
}

export const UserFilters = ({ activeFilter, onFilterChange }: UserFiltersProps) => {
  return (
    <div className="flex gap-2 mb-4">
      <Button 
        variant={activeFilter === "all" ? "default" : "outline"} 
        onClick={() => onFilterChange("all")}
      >
        All Users
      </Button>
      <Button 
        variant={activeFilter === "admin" ? "default" : "outline"} 
        onClick={() => onFilterChange("admin")}
      >
        Admins
      </Button>
      <Button 
        variant={activeFilter === "trainee" ? "default" : "outline"} 
        onClick={() => onFilterChange("trainee")}
      >
        Trainees
      </Button>
    </div>
  );
};
