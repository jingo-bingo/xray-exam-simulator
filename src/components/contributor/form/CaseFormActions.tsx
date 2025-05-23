
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Control } from "react-hook-form";

interface CaseFormData {
  title: string;
  region: string;
  age_group: string;
  clinical_history?: string;
  save_as_draft: boolean;
}

interface CaseFormActionsProps {
  control: Control<CaseFormData>;
  isSubmitting: boolean;
  caseId?: string;
  onCancel: () => void;
}

export const CaseFormActions = ({ 
  control, 
  isSubmitting, 
  caseId, 
  onCancel 
}: CaseFormActionsProps) => {
  return (
    <>
      <FormField
        control={control}
        name="save_as_draft"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel>Save as Draft</FormLabel>
          </FormItem>
        )}
      />

      <div className="flex gap-4 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-medical-primary hover:bg-medical-primary/90"
        >
          {isSubmitting ? "Submitting..." : (caseId ? "Update Case" : "Submit Case")}
        </Button>
      </div>
    </>
  );
};
