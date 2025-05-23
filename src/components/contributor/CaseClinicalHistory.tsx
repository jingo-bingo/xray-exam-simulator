
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";

interface CaseClinicalHistoryProps {
  control: Control<any>;
}

export const CaseClinicalHistory = ({ control }: CaseClinicalHistoryProps) => {
  return (
    <FormField
      control={control}
      name="clinical_history"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Clinical History (Optional)</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Enter relevant clinical history..."
              className="min-h-[100px]"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
