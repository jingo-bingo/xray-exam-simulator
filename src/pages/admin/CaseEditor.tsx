import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import { Database } from "@/integrations/supabase/types";

type RegionType = Database["public"]["Enums"]["region_type"];
type DifficultyLevel = Database["public"]["Enums"]["difficulty_level"];
type AgeGroup = Database["public"]["Enums"]["age_group"];

type Case = {
  title: string;
  description: string | null;
  region: RegionType;
  age_group: AgeGroup;
  difficulty: DifficultyLevel;
  is_free_trial: boolean;
  published: boolean;
  clinical_history: string | null;
  case_number: string;
};

const CaseEditor = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isNewCase = !id || id === "new";
  
  const [caseData, setCaseData] = useState<Case>({
    title: "",
    description: "",
    region: "chest",
    age_group: "adult",
    difficulty: "medium",
    is_free_trial: false,
    published: false,
    clinical_history: "",
    case_number: `CASE-${Date.now().toString().slice(-6)}`
  });
  
  useEffect(() => {
    console.log("CaseEditor: Component mounted, isNewCase:", isNewCase, "id:", id);
  }, [isNewCase, id]);
  
  const { isLoading: isLoadingCase } = useQuery({
    queryKey: ["admin-case-detail", id],
    queryFn: async () => {
      if (isNewCase) {
        console.log("CaseEditor: New case, skipping fetch");
        return null;
      }
      
      console.log("CaseEditor: Fetching case details", { id });
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) {
        console.error("CaseEditor: Error fetching case details", error);
        toast.error("Failed to load case");
        return null;
      }
      
      console.log("CaseEditor: Case fetched successfully", data);
      setCaseData(data);
      return data;
    },
    enabled: !isNewCase
  });
  
  const saveCaseMutation = useMutation({
    mutationFn: async (data: Case) => {
      if (isNewCase) {
        console.log("CaseEditor: Creating new case", data);
        const { data: createdCase, error } = await supabase
          .from("cases")
          .insert({
            ...data,
            created_by: user?.id
          })
          .select()
          .single();
        
        if (error) {
          console.error("CaseEditor: Error creating case", error);
          throw error;
        }
        
        console.log("CaseEditor: Case created successfully", createdCase);
        return createdCase;
      } else {
        console.log("CaseEditor: Updating case", { id, ...data });
        const { data: updatedCase, error } = await supabase
          .from("cases")
          .update(data)
          .eq("id", id)
          .select()
          .single();
        
        if (error) {
          console.error("CaseEditor: Error updating case", error);
          throw error;
        }
        
        console.log("CaseEditor: Case updated successfully", updatedCase);
        return updatedCase;
      }
    },
    onSuccess: () => {
      toast.success(isNewCase ? "Case created successfully" : "Case updated successfully");
      navigate("/admin/cases");
    },
    onError: (error) => {
      console.error("CaseEditor: Mutation error", error);
      toast.error(`Failed to save case: ${(error as Error).message}`);
    }
  });
  
  const handleInputChange = (field: keyof Case, value: any) => {
    console.log("CaseEditor: Input changed", { field, value });
    setCaseData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("CaseEditor: Form submitted", caseData);
    saveCaseMutation.mutate(caseData);
  };
  
  const handleCancel = () => {
    console.log("CaseEditor: Cancel clicked, navigating back to case management");
    navigate("/admin/cases");
  };
  
  if (!isNewCase && isLoadingCase) {
    return <div>Loading case...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {isNewCase ? "Create New Case" : "Edit Case"}
        </h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={caseData.title} 
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={caseData.description || ""} 
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clinicalHistory">Clinical History</Label>
              <Textarea 
                id="clinicalHistory" 
                value={caseData.clinical_history || ""} 
                onChange={(e) => handleInputChange("clinical_history", e.target.value)}
                rows={4}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="caseNumber">Case Number</Label>
              <Input 
                id="caseNumber" 
                value={caseData.case_number} 
                onChange={(e) => handleInputChange("case_number", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select 
                value={caseData.region} 
                onValueChange={(value: RegionType) => handleInputChange("region", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chest">Chest</SelectItem>
                  <SelectItem value="abdomen">Abdomen</SelectItem>
                  <SelectItem value="head">Head</SelectItem>
                  <SelectItem value="musculoskeletal">Musculoskeletal</SelectItem>
                  <SelectItem value="cardiovascular">Cardiovascular</SelectItem>
                  <SelectItem value="neuro">Neuro</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select 
                value={caseData.difficulty} 
                onValueChange={(value: DifficultyLevel) => handleInputChange("difficulty", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ageGroup">Age Group</Label>
              <Select 
                value={caseData.age_group} 
                onValueChange={(value: AgeGroup) => handleInputChange("age_group", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select age group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pediatric">Pediatric</SelectItem>
                  <SelectItem value="adult">Adult</SelectItem>
                  <SelectItem value="geriatric">Geriatric</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Switch 
                checked={caseData.is_free_trial} 
                onCheckedChange={(checked) => handleInputChange("is_free_trial", checked)}
                id="freeTrialSwitch"
              />
              <Label htmlFor="freeTrialSwitch">Free Trial Case</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                checked={caseData.published} 
                onCheckedChange={(checked) => handleInputChange("published", checked)}
                id="publishedSwitch"
              />
              <Label htmlFor="publishedSwitch">Published</Label>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={saveCaseMutation.isPending}
          >
            {saveCaseMutation.isPending ? "Saving..." : (isNewCase ? "Create Case" : "Update Case")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CaseEditor;
