
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Control } from "react-hook-form";

interface CaseFormActionsProps {
  control: Control<any>;
  isSubmitting: boolean;
  caseId?: string;
  onCancel: () => void;
}

export const CaseFormActions = ({ control, isSubmitting, caseId, onCancel }: CaseFormActionsProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="save_as_draft"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Save as draft
              </label>
              <p className="text-xs text-muted-foreground">
                Save this case as a draft instead of submitting for review
              </p>
            </div>
          </FormItem>
        )}
      />

      <div className="flex gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : caseId ? "Update Case" : "Submit Case"}
        </Button>
      </div>
    </div>
  );
};
