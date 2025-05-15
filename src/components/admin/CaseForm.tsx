
import { useState } from "react";
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
import { DicomUploader } from "@/components/admin/DicomUploader";
import { Database } from "@/integrations/supabase/types";

type RegionType = Database["public"]["Enums"]["region_type"];
type DifficultyLevel = Database["public"]["Enums"]["difficulty_level"];
type AgeGroup = Database["public"]["Enums"]["age_group"];

export type Case = {
  title: string;
  description: string | null;
  region: RegionType;
  age_group: AgeGroup;
  difficulty: DifficultyLevel;
  is_free_trial: boolean;
  published: boolean;
  clinical_history: string | null;
  case_number: string;
  dicom_path: string | null;
};

interface CaseFormProps {
  caseData: Case;
  isNewCase: boolean;
  onInputChange: (field: keyof Case, value: any) => void;
  onDicomUpload: (filePath: string) => void;
}

export const CaseForm = ({ caseData, isNewCase, onInputChange, onDicomUpload }: CaseFormProps) => {
  console.log("CaseForm: Rendering with data", caseData);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input 
            id="title" 
            value={caseData.title} 
            onChange={(e) => onInputChange("title", e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description" 
            value={caseData.description || ""} 
            onChange={(e) => onInputChange("description", e.target.value)}
            rows={4}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="clinicalHistory">Clinical History</Label>
          <Textarea 
            id="clinicalHistory" 
            value={caseData.clinical_history || ""} 
            onChange={(e) => onInputChange("clinical_history", e.target.value)}
            rows={4}
          />
        </div>
        
        <DicomUploader 
          currentPath={caseData.dicom_path} 
          onUploadComplete={onDicomUpload}
          isTemporaryUpload={isNewCase} // Only mark as temporary during new case creation
        />
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="caseNumber">Case Number</Label>
          <Input 
            id="caseNumber" 
            value={caseData.case_number} 
            onChange={(e) => onInputChange("case_number", e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="region">Region</Label>
          <Select 
            value={caseData.region} 
            onValueChange={(value: RegionType) => onInputChange("region", value)}
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
            onValueChange={(value: DifficultyLevel) => onInputChange("difficulty", value)}
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
            onValueChange={(value: AgeGroup) => onInputChange("age_group", value)}
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
            onCheckedChange={(checked) => onInputChange("is_free_trial", checked)}
            id="freeTrialSwitch"
          />
          <Label htmlFor="freeTrialSwitch">Free Trial Case</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            checked={caseData.published} 
            onCheckedChange={(checked) => onInputChange("published", checked)}
            id="publishedSwitch"
          />
          <Label htmlFor="publishedSwitch">Published</Label>
        </div>
      </div>
    </div>
  );
};
