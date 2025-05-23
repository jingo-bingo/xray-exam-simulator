
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StandardizedQuestionSectionProps {
  control: Control<any>;
}

export const StandardizedQuestionSection = ({ control }: StandardizedQuestionSectionProps) => {
  return (
    <Card className="border-medical-border">
      <CardHeader>
        <CardTitle className="text-lg">Examination Question</CardTitle>
        <CardDescription>
          Please provide your model answer to the standardized examination question below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 bg-medical-lighter rounded-md border border-medical-border">
          <h4 className="font-medium text-medical-dark mb-2">Standard Question:</h4>
          <p className="text-medical-dark italic">
            "Please provide a short report for this patient and include your recommended next step for onward management"
          </p>
        </div>
        
        <FormField
          control={control}
          name="model_answer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Model Answer</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide your detailed answer to the examination question..."
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
  );
};
