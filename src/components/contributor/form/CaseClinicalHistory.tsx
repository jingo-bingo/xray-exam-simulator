
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";

interface CaseFormData {
  title: string;
  region: string;
  age_group: string;
  clinical_history?: string;
  save_as_draft: boolean;
}

interface CaseClinicalHistoryProps {
  control: Control<CaseFormData>;
}

export const CaseClinicalHistory = ({ control }: CaseClinicalHistoryProps) => {
  return (
    <FormField
      control={control}
      name="clinical_history"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Clinical History</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Patient's clinical history and presentation"
              className="resize-none min-h-[100px]"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
