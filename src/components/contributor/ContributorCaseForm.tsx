
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
import { DicomUploader } from "@/components/admin/DicomUploader";

type RegionType = Database["public"]["Enums"]["region_type"];
type AgeGroup = Database["public"]["Enums"]["age_group"];
type ReviewStatus = Database["public"]["Enums"]["review_status"];

// Simplified schema without case_number, difficulty, description, and is_free_trial
const caseFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  region: z.enum(["chest", "abdomen", "head", "musculoskeletal", "cardiovascular", "neuro", "other"]),
  age_group: z.enum(["pediatric", "adult", "geriatric"]),
  clinical_history: z.string().optional(),
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
  const [dicomPath, setDicomPath] = useState<string | null>(null);

  const form = useForm<CaseFormData>({
    resolver: zodResolver(caseFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      region: initialData?.region as RegionType || "chest",
      age_group: initialData?.age_group as AgeGroup || "adult",
      clinical_history: initialData?.clinical_history || "",
      save_as_draft: false,
    },
  });

  const handleDicomUploadComplete = (filePath: string) => {
    setDicomPath(filePath);
  };

  const onSubmit = async (data: CaseFormData) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a case",
        variant: "destructive",
      });
      return;
    }

    // Validate that DICOM has been uploaded
    if (!dicomPath) {
      toast({
        title: "Error",
        description: "Please upload a DICOM image before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Determine the review status based on save_as_draft
      const reviewStatus: ReviewStatus = data.save_as_draft ? 'draft' : 'pending_review';

      const caseData = {
        title: data.title,
        region: data.region,
        age_group: data.age_group,
        clinical_history: data.clinical_history,
        submitted_by: user.id,
        created_by: user.id,
        review_status: reviewStatus,
        published: false, // Contributors cannot publish directly
        dicom_path: dicomPath,
        // Default values for the fields removed from the form
        description: "", // Empty description
        case_number: `CONTRIB-${Date.now().toString().slice(-6)}`, // Auto-generated case number
        difficulty: "medium" as const, // Default difficulty
        is_free_trial: false, // Default is not free trial
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

            {/* DICOM Upload Section */}
            <div className="mb-6">
              <DicomUploader 
                currentPath={dicomPath} 
                onUploadComplete={handleDicomUploadComplete} 
                isTemporaryUpload={true}
              />
              {!dicomPath && (
                <p className="mt-2 text-sm text-red-500">
                  A DICOM image is required to submit a case.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
