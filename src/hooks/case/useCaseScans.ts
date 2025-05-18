
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { CaseScan } from "@/components/admin/ScanManager";

export const useCaseScans = () => {
  // Track pending operations
  const [isProcessingScans, setIsProcessingScans] = useState(false);
  
  // Function to save scans for a case
  const saveScans = useCallback(async (caseId: string, scans: CaseScan[]) => {
    if (!caseId) return;
    
    console.log("useCaseScans: Saving scans for case", caseId, scans);
    setIsProcessingScans(true);
    
    try {
      // Process each scan
      for (const scan of scans) {
        // Skip scans without a DICOM path
        if (!scan.dicom_path) continue;
        
        // Update scan case_id with the actual case ID
        const updatedScan = { ...scan, case_id: caseId };
        
        // If scan is marked for deletion and has an ID, delete it
        if (scan.isDeleted && scan.id) {
          const { error: deleteError } = await supabase
            .from('case_scans')
            .delete()
            .eq('id', scan.id);
          
          if (deleteError) {
            console.error("useCaseScans: Error deleting scan", deleteError);
            toast({
              title: "Error",
              description: `Failed to delete scan: ${deleteError.message}`,
              variant: "destructive"
            });
          }
          continue;
        }
        
        // Strip client-side flags
        const { isNew, isDeleted, ...scanToSave } = updatedScan;
        
        // If scan has an ID, update it; otherwise insert new scan
        if (scan.id) {
          const { error: updateError } = await supabase
            .from('case_scans')
            .update(scanToSave)
            .eq('id', scan.id);
          
          if (updateError) {
            console.error("useCaseScans: Error updating scan", updateError);
            toast({
              title: "Error",
              description: `Failed to update scan: ${updateError.message}`,
              variant: "destructive"
            });
          }
        } else {
          const { error: insertError } = await supabase
            .from('case_scans')
            .insert(scanToSave);
          
          if (insertError) {
            console.error("useCaseScans: Error inserting scan", insertError);
            toast({
              title: "Error",
              description: `Failed to save scan: ${insertError.message}`,
              variant: "destructive"
            });
          }
        }
      }
    } catch (error) {
      console.error("useCaseScans: Error saving scans", error);
      toast({
        title: "Error",
        description: "Failed to save case scans",
        variant: "destructive"
      });
    } finally {
      setIsProcessingScans(false);
    }
  }, []);

  return {
    saveScans,
    isProcessingScans
  };
};
