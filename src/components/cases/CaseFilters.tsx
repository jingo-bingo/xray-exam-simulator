
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Database } from "@/integrations/supabase/types";

type RegionType = Database["public"]["Enums"]["region_type"];
type DifficultyLevel = Database["public"]["Enums"]["difficulty_level"];

interface CaseFiltersProps {
  onRegionChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
}

export const CaseFilters = ({ onRegionChange, onDifficultyChange }: CaseFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Select onValueChange={onRegionChange}>
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
      
      <Select onValueChange={onDifficultyChange}>
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
  );
};
