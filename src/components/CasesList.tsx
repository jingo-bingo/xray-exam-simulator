
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Database } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";

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

type CaseAttempt = {
  id: string;
  case_id: string;
  status: Database["public"]["Enums"]["attempt_status"];
  completed_at: string | null;
};

const ITEMS_PER_PAGE = 10;

const CasesList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [regionFilter, setRegionFilter] = useState<RegionType | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Fetch cases from the database
  const { data: cases, isLoading: casesLoading, error: casesError } = useQuery({
    queryKey: ["cases", { regionFilter, difficultyFilter }],
    queryFn: async () => {
      console.log("CasesList: Fetching cases with filters:", { regionFilter, difficultyFilter });
      
      let query = supabase
        .from("cases")
        .select("*")
        .eq("published", true);

      if (regionFilter) {
        query = query.eq("region", regionFilter);
      }

      if (difficultyFilter) {
        query = query.eq("difficulty", difficultyFilter);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("CasesList: Error fetching cases:", error.message);
        throw new Error(error.message);
      }
      
      console.log("CasesList: Cases fetched successfully, count:", data?.length);
      return data as Case[];
    },
    enabled: true,
  });

  // Fetch case attempts for the current user from the database
  const { data: attempts, isLoading: attemptsLoading } = useQuery({
    queryKey: ["case-attempts", user?.id],
    queryFn: async () => {
      if (!user) return [];

      console.log("CasesList: Fetching case attempts for user:", user.id);
      
      const { data, error } = await supabase
        .from("case_attempts")
        .select("*")
        .eq("user_id", user.id);
      
      if (error) {
        console.error("CasesList: Error fetching case attempts:", error.message);
        toast({
          title: "Error",
          description: "Failed to load your progress data",
          variant: "destructive",
        });
        return [];
      }
      
      console.log("CasesList: Case attempts fetched successfully, count:", data?.length);
      return data as CaseAttempt[];
    },
    enabled: !!user,
  });

  const handleRegionChange = (value: string) => {
    console.log("CasesList: Region filter changed to:", value);
    setRegionFilter(value === "all" ? null : value as RegionType);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleDifficultyChange = (value: string) => {
    console.log("CasesList: Difficulty filter changed to:", value);
    setDifficultyFilter(value === "all" ? null : value as DifficultyLevel);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const getRegionDisplayName = (region: string): string => {
    switch (region) {
      case "chest": return "CXR";
      case "abdomen": return "AXR";
      case "head": return "Head";
      case "musculoskeletal": return "MSK";
      case "cardiovascular": return "CV";
      case "neuro": return "Neuro";
      default: return region.charAt(0).toUpperCase() + region.slice(1);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-600";
      case "medium":
        return "bg-yellow-600";
      case "hard":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };
  
  // Check if the user has attempted a case using the database data
  const getAttemptStatus = (caseId: string): { attempted: boolean; status: string } => {
    if (!attempts || attempts.length === 0) {
      return { attempted: false, status: "Not Attempted" };
    }
    
    const caseAttempt = attempts.find(attempt => attempt.case_id === caseId);
    
    if (!caseAttempt) {
      return { attempted: false, status: "Not Attempted" };
    }
    
    if (caseAttempt.status === "completed") {
      return { attempted: true, status: "Completed" };
    } else {
      return { attempted: true, status: "In Progress" };
    }
  };
  
  // Calculate pagination
  const totalCases = cases?.length || 0;
  const totalPages = Math.ceil(totalCases / ITEMS_PER_PAGE);
  const paginatedCases = cases ? 
    cases.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE) : [];
  
  // Calculate progress stats from the actual database data
  const attemptedCount = attempts && cases ? 
    cases.filter(c => !!attempts.find(a => a.case_id === c.id)).length : 0;
  const completedCount = attempts && cases ? 
    cases.filter(c => !!attempts.find(a => a.case_id === c.id && a.status === "completed")).length : 0;
  const remainingCount = totalCases - attemptedCount;
  const attemptedPercentage = totalCases > 0 ? Math.round((completedCount / totalCases) * 100) : 0;

  const isLoading = casesLoading || (user && attemptsLoading);

  if (isLoading) return <div className="text-center p-8">Loading cases...</div>;
  if (casesError) return <div className="text-center p-8 text-red-500">Error loading cases: {(casesError as Error).message}</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold text-radiology-light">Available Cases</h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Select 
            onValueChange={handleRegionChange}
          >
            <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="chest">Chest</SelectItem>
              <SelectItem value="abdomen">Abdomen</SelectItem>
              <SelectItem value="head">Head</SelectItem>
              <SelectItem value="musculoskeletal">Musculoskeletal</SelectItem>
              <SelectItem value="cardiovascular">Cardiovascular</SelectItem>
              <SelectItem value="neuro">Neuro</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            onValueChange={handleDifficultyChange}
          >
            <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {cases && cases.length > 0 ? (
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
              {paginatedCases.map((caseItem, index) => {
                const { attempted, status } = getAttemptStatus(caseItem.id);
                
                return (
                  <TableRow key={caseItem.id} className="border-gray-700">
                    <TableCell className="text-center">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
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
      ) : (
        <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
          <h3 className="text-xl font-semibold text-radiology-light mb-2">No cases found</h3>
          <p className="text-gray-400">
            Try changing your filters or check back later for new cases.
          </p>
        </div>
      )}
      
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
              <PaginationItem key={page}>
                <PaginationLink 
                  isActive={page === currentPage}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      
      {/* Progress panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-medium">Attempted Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{attemptedCount}</span>
              <span className="text-sm text-gray-400">of {totalCases} total</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-medium">Remaining Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{remainingCount}</span>
              <span className="text-sm text-gray-400">still to complete</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-medium">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{attemptedPercentage}% complete</span>
                <span>{completedCount}/{totalCases}</span>
              </div>
              <Progress value={attemptedPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CasesList;

