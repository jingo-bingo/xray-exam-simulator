
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Database } from "@/integrations/supabase/types";

type RegionType = Database["public"]["Enums"]["region_type"];
type AgeGroup = Database["public"]["Enums"]["age_group"];
type DifficultyLevel = Database["public"]["Enums"]["difficulty_level"];

const caseFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  region: z.enum(["chest", "abdomen", "head", "musculoskeletal", "cardiovascular", "neuro", "other"]),
  age_group: z.enum(["pediatric", "adult", "geriatric"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  clinical_history: z.string().optional(),
  case_number: z.string().min(1, "Case number is required"),
  is_free_trial: z.boolean().default(false),
  save_as_draft: z.boolean().default(false),
});

type CaseFormData = z.infer<typeof caseFormSchema>;

interface ContributorCaseFormProps {
  initialData?: Partial<CaseFormData>;
  caseId?: string;
  onSuccess?: () => void;
}

export const ContributorCaseForm = ({ initialData, caseId, onSuccess }: ContributorCaseFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CaseFormData>({
    resolver: zodResolver(caseFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      region: initialData?.region as RegionType || "chest",
      age_group: initialData?.age_group as AgeGroup || "adult",
      difficulty: initialData?.difficulty as DifficultyLevel || "medium",
      clinical_history: initialData?.clinical_history || "",
      case_number: initialData?.case_number || "",
      is_free_trial: initialData?.is_free_trial || false,
      save_as_draft: false,
    },
  });

  const onSubmit = async (data: CaseFormData) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a case",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const caseData = {
        title: data.title,
        description: data.description,
        region: data.region,
        age_group: data.age_group,
        difficulty: data.difficulty,
        clinical_history: data.clinical_history,
        case_number: data.case_number,
        is_free_trial: data.is_free_trial,
        submitted_by: user.id,
        created_by: user.id,
        review_status: data.save_as_draft ? 'draft' : 'pending_review',
        published: false, // Contributors cannot publish directly
      };

      if (caseId) {
        // Update existing case
        const { error } = await supabase
          .from("cases")
          .update(caseData)
          .eq("id", caseId);

        if (error) throw error;

        toast({
          title: "Case updated successfully",
          description: data.save_as_draft ? "Your case has been saved as a draft" : "Your case has been submitted for review",
        });
      } else {
        // Create new case
        const { error } = await supabase
          .from("cases")
          .insert(caseData);

        if (error) throw error;

        toast({
          title: "Case submitted successfully",
          description: data.save_as_draft ? "Your case has been saved as a draft" : "Your case has been submitted for review",
        });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/cases/submit");
      }
    } catch (error: any) {
      console.error("Error submitting case:", error);
      toast({
        title: "Error submitting case",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{caseId ? "Edit Case" : "Submit New Case"}</CardTitle>
        <CardDescription>
          {caseId ? "Update your case submission" : "Submit a new case for review by administrators"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
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
                control={form.control}
                name="case_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., CASE-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the case"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
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
                control={form.control}
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

              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
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

            <div className="flex items-center space-x-6">
              <FormField
                control={form.control}
                name="is_free_trial"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Free Trial Case</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
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
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/cases/submit")}
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
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
