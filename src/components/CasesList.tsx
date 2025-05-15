
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

const CasesList = () => {
  const navigate = useNavigate();
  const [regionFilter, setRegionFilter] = useState<RegionType | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel | null>(null);

  const { data: cases, isLoading, error } = useQuery({
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
  });

  const handleRegionChange = (value: string) => {
    console.log("CasesList: Region filter changed to:", value);
    setRegionFilter(value === "all" ? null : value as RegionType);
  };

  const handleDifficultyChange = (value: string) => {
    console.log("CasesList: Difficulty filter changed to:", value);
    setDifficultyFilter(value === "all" ? null : value as DifficultyLevel);
  };

  if (isLoading) return <div className="text-center p-8">Loading cases...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error loading cases: {(error as Error).message}</div>;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "hard":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <h2 className="text-2xl font-bold text-radiology-light">Available Cases</h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Select 
            onValueChange={handleRegionChange}
          >
            <SelectTrigger className="w-[180px]">
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
            <SelectTrigger className="w-[180px]">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((caseItem) => (
            <Card key={caseItem.id} className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-radiology-light">{caseItem.title}</CardTitle>
                  {caseItem.is_free_trial && (
                    <Badge variant="outline" className="bg-blue-600 text-white border-blue-600">Free Trial</Badge>
                  )}
                </div>
                <CardDescription className="text-gray-400">
                  {caseItem.region.charAt(0).toUpperCase() + caseItem.region.slice(1)} - 
                  {caseItem.age_group.charAt(0).toUpperCase() + caseItem.age_group.slice(1)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4 line-clamp-2">{caseItem.description || "No description available."}</p>
                <Badge className={`${getDifficultyColor(caseItem.difficulty)} text-white`}>
                  {caseItem.difficulty.charAt(0).toUpperCase() + caseItem.difficulty.slice(1)}
                </Badge>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => navigate(`/cases/${caseItem.id}`)}
                >
                  Start Case
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold text-radiology-light mb-2">No cases found</h3>
          <p className="text-gray-400">
            Try changing your filters or check back later for new cases.
          </p>
        </div>
      )}
    </div>
  );
};

export default CasesList;
