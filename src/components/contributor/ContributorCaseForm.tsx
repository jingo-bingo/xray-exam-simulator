
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Database } from "@/integrations/supabase/types";
import { MultiScanUploader, CaseScan } from "./MultiScanUploader";
import { makeDicomFilePermanent } from "@/utils/dicomStorage";
import { CaseBasicFields } from "./CaseBasicFields";
import { CaseClinicalHistory } from "./CaseClinicalHistory";
import { CaseFormActions } from "./CaseFormActions";

type RegionType = Database["public"]["Enums"]["region_type"];
type AgeGroup = Database["public"]["Enums"]["age_group"];
type ReviewStatus = Database["public"]["Enums"]["review_status"];

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
  const [scans, setScans] = useState<CaseScan[]>([]);

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

  const onSubmit = async (data: CaseFormData) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a case",
        variant: "destructive",
      });
      return;
    }

    // Validate that at least one scan has been uploaded
    const validScans = scans.filter(scan => scan.dicom_path);
    if (validScans.length === 0) {
      toast({
        title: "Error",
        description: "Please upload at least one DICOM image before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewStatus: ReviewStatus = data.save_as_draft ? 'draft' : 'pending_review';

      const caseData = {
        title: data.title,
        region: data.region,
        age_group: data.age_group,
        clinical_history: data.clinical_history,
        submitted_by: user.id,
        created_by: user.id,
        review_status: reviewStatus,
        published: false,
        dicom_path: null, // No longer used for multi-scan cases
        description: "",
        case_number: `CONTRIB-${Date.now().toString().slice(-6)}`,
        difficulty: "medium" as const,
        is_free_trial: false,
      };

      let savedCaseId: string;

      if (caseId) {
        // Update existing case
        const { error } = await supabase
          .from("cases")
          .update(caseData)
          .eq("id", caseId);

        if (error) throw error;
        savedCaseId = caseId;
      } else {
        // Create new case
        const { data: createdCase, error } = await supabase
          .from("cases")
          .insert(caseData)
          .select()
          .single();

        if (error) throw error;
        savedCaseId = createdCase.id;
      }

      // Process and save scans
      for (let i = 0; i < validScans.length; i++) {
        const scan = validScans[i];
        let finalDicomPath = scan.dicom_path;

        // Make temporary files permanent
        if (scan.dicom_path.startsWith('temp_')) {
          const permanentPath = await makeDicomFilePermanent(scan.dicom_path);
          if (permanentPath) {
            finalDicomPath = permanentPath;
          }
        }

        const scanData = {
          case_id: savedCaseId,
          dicom_path: finalDicomPath,
          label: scan.label || "AP", // Default to AP instead of View X
          display_order: i + 1,
        };

        if (scan.id) {
          // Update existing scan
          const { error } = await supabase
            .from("case_scans")
            .update(scanData)
            .eq("id", scan.id);

          if (error) throw error;
        } else {
          // Insert new scan
          const { error } = await supabase
            .from("case_scans")
            .insert(scanData);

          if (error) throw error;
        }
      }

      toast({
        title: "Case submitted successfully",
        description: data.save_as_draft ? "Your case has been saved as a draft" : "Your case has been submitted for review",
      });

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

  // Start with one empty scan if no scans exist
  const handleScansChange = (newScans: CaseScan[]) => {
    setScans(newScans);
  };

  // Initialize with one empty scan if starting fresh
  useState(() => {
    if (scans.length === 0) {
      setScans([{
        dicom_path: "",
        label: "AP", // Default to AP instead of Primary View
        display_order: 1,
        isNew: true
      }]);
    }
  });

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
            <CaseBasicFields control={form.control as any} />

            {/* Multi-Scan Upload Section */}
            <div className="mb-6">
              <MultiScanUploader 
                scans={scans}
                onScansChange={handleScansChange}
                isTemporaryUpload={true}
              />
            </div>

            <CaseClinicalHistory control={form.control as any} />

            <CaseFormActions 
              control={form.control as any}
              isSubmitting={isSubmitting}
              caseId={caseId}
              onCancel={() => navigate("/cases/submit")}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
