
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { Database } from "@/integrations/supabase/types";

type RegionType = Database["public"]["Enums"]["region_type"];
type DifficultyLevel = Database["public"]["Enums"]["difficulty_level"];

type Case = {
  id: string;
  title: string;
  description: string;
  region: RegionType;
  age_group: string;
  difficulty: DifficultyLevel;
  is_free_trial: boolean;
};

interface CasesTableProps {
  cases: Case[];
  currentPage: number;
  itemsPerPage: number;
  getRegionDisplayName: (region: string) => string;
  getDifficultyColor: (difficulty: string) => string;
  getAttemptStatus: (caseId: string) => { attempted: boolean; status: string };
}

export const CasesTable = ({ 
  cases, 
  currentPage, 
  itemsPerPage,
  getRegionDisplayName,
  getDifficultyColor,
  getAttemptStatus
}: CasesTableProps) => {
  const navigate = useNavigate();

  if (!cases || cases.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 text-center border border-medical-border shadow-sm">
        <h3 className="text-xl font-semibold text-medical-dark mb-2">No cases found</h3>
        <p className="text-medical-muted">
          Try changing your filters or check back later for new cases.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-medical-border overflow-hidden bg-white shadow-sm">
      <Table>
        <TableHeader className="bg-medical-lighter">
          <TableRow>
            <TableHead className="w-12 text-center">№</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Age Group</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map((caseItem, index) => {
            const { attempted, status } = getAttemptStatus(caseItem.id);
            
            return (
              <TableRow key={caseItem.id} className="border-medical-border">
                <TableCell className="text-center">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                <TableCell className="font-medium">{caseItem.title}</TableCell>
                <TableCell>{getRegionDisplayName(caseItem.region)}</TableCell>
                <TableCell>{caseItem.age_group.charAt(0).toUpperCase() + caseItem.age_group.slice(1)}</TableCell>
                <TableCell>
                  <Badge className={`${getDifficultyColor(caseItem.difficulty)}`}>
                    {caseItem.difficulty.charAt(0).toUpperCase() + caseItem.difficulty.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {status === "Completed" ? (
                    <Badge variant="outline" className="border-medical-success text-medical-success">
                      Completed
                    </Badge>
                  ) : status === "In Progress" ? (
                    <Badge variant="outline" className="border-medical-primary text-medical-primary">
                      In Progress
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-medical-warning text-medical-warning">
                      Not Attempted
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    onClick={() => navigate(`/cases/${caseItem.id}`)}
                    variant="outline"
                    size="sm"
                    className="border-medical-border hover:bg-medical-lighter"
                  >
                    {attempted ? "Review" : "Start Tutorial"}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
