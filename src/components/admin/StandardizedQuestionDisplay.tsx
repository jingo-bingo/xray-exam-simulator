
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StandardizedQuestionDisplayProps {
  control: Control<any>;
}

export const StandardizedQuestionDisplay = ({ control }: StandardizedQuestionDisplayProps) => {
  return (
    <div className="border-t border-medical-border pt-6 mt-6">
      <Card className="border-medical-border">
        <CardHeader>
          <CardTitle className="text-xl">Standardized Examination Question</CardTitle>
          <CardDescription>
            All cases use the same standardized question. You can edit the model answer below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-medical-lighter rounded-md border border-medical-border">
            <h4 className="font-medium text-medical-dark mb-2">Question:</h4>
            <p className="text-medical-dark font-medium">
              "Please provide a short report for this patient and include your recommended next step for onward management"
            </p>
          </div>
          
          <FormField
            control={control}
            name="model_answer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model Answer</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter the model answer for this case..."
                    className="min-h-[150px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
};
