
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";

interface CaseBasicFieldsProps {
  control: Control<any>;
}

export const CaseBasicFields = ({ control }: CaseBasicFieldsProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Case Title</FormLabel>
            <FormControl>
              <Input placeholder="Enter case title" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="region"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Region</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
              </FormControl>
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
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="age_group"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Age Group</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select age group" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="pediatric">Pediatric</SelectItem>
                <SelectItem value="adult">Adult</SelectItem>
                <SelectItem value="geriatric">Geriatric</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
