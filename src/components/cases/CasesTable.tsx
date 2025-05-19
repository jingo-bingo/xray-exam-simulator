
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
      <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
        <h3 className="text-xl font-semibold text-radiology-light mb-2">No cases found</h3>
        <p className="text-gray-400">
          Try changing your filters or check back later for new cases.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-gray-700 overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-800">
          <TableRow>
            <TableHead className="w-12 text-center">#</TableHead>
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
              <TableRow key={caseItem.id} className="border-gray-700">
                <TableCell className="text-center">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                <TableCell className="font-medium">{caseItem.title}</TableCell>
                <TableCell>{getRegionDisplayName(caseItem.region)}</TableCell>
                <TableCell>{caseItem.age_group.charAt(0).toUpperCase() + caseItem.age_group.slice(1)}</TableCell>
                <TableCell>
                  <Badge className={`${getDifficultyColor(caseItem.difficulty)} text-white`}>
                    {caseItem.difficulty.charAt(0).toUpperCase() + caseItem.difficulty.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {status === "Completed" ? (
                    <Badge variant="outline" className="border-green-500 text-green-500">
                      Completed
                    </Badge>
                  ) : status === "In Progress" ? (
                    <Badge variant="outline" className="border-blue-500 text-blue-500">
                      In Progress
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                      Not Attempted
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    onClick={() => navigate(`/cases/${caseItem.id}`)}
                    variant="outline"
                    size="sm"
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
