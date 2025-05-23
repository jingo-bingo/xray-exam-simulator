
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DicomUploader } from "./DicomUploader";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface CaseScan {
  id?: string;
  case_id: string;
  dicom_path: string | null;
  label: string;
  display_order: number;
  isNew?: boolean; // Client-side flag to track new scans
  isDeleted?: boolean; // Client-side flag to track deletions
}

interface ScanManagerProps {
  caseId: string | undefined;
  isNewCase: boolean;
  mainDicomPath: string | null;
}

const STANDARD_LABELS = ["Lateral", "AP"];

export const ScanManager = ({ caseId, isNewCase, mainDicomPath }: ScanManagerProps) => {
  const [scans, setScans] = useState<CaseScan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing scans when component mounts
  useEffect(() => {
    const fetchScans = async () => {
      if (!caseId || isNewCase) {
        // For new cases, initialize with an empty scan
        if (isNewCase) {
          const initialScan: CaseScan = {
            case_id: 'temp', // Will be replaced when case is created
            dicom_path: mainDicomPath,
            label: 'AP', // Default to AP instead of Primary View
            display_order: 1,
            isNew: true
          };
          setScans([initialScan]);
        }
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('case_scans')
          .select('*')
          .eq('case_id', caseId)
          .order('display_order', { ascending: true });

        if (error) throw error;

        // If we have data from DB, use that
        if (data && data.length > 0) {
          setScans(data);
        } else if (mainDicomPath) {
          // If no scan records but we have a mainDicomPath, create an initial one
          const initialScan: CaseScan = {
            case_id: caseId,
            dicom_path: mainDicomPath,
            label: 'AP', // Default to AP instead of Primary View
            display_order: 1,
            isNew: true
          };
          setScans([initialScan]);
        } else {
          // No scans and no main DICOM path
          setScans([]);
        }
      } catch (err) {
        console.error("Error fetching case scans:", err);
        setError("Failed to load case scans");
        
        // Fallback to main DICOM path if available
        if (mainDicomPath) {
          const initialScan: CaseScan = {
            case_id: caseId || 'temp',
            dicom_path: mainDicomPath,
            label: 'AP', // Default to AP instead of Primary View
            display_order: 1,
            isNew: true
          };
          setScans([initialScan]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchScans();
  }, [caseId, isNewCase, mainDicomPath]);

  // Handle DICOM upload for a scan
  const handleDicomUpload = useCallback((scanIndex: number, filePath: string) => {
    setScans(prevScans => {
      const updatedScans = [...prevScans];
      updatedScans[scanIndex] = {
        ...updatedScans[scanIndex],
        dicom_path: filePath,
        isNew: true // Mark as new or modified
      };
      return updatedScans;
    });
  }, []);

  // Handle label change for a scan
  const handleLabelChange = useCallback((scanIndex: number, label: string) => {
    setScans(prevScans => {
      const updatedScans = [...prevScans];
      updatedScans[scanIndex] = {
        ...updatedScans[scanIndex],
        label,
        isNew: updatedScans[scanIndex].isNew || !!updatedScans[scanIndex].id // Mark as new if it wasn't already
      };
      return updatedScans;
    });
  }, []);

  // Add a new scan
  const addScan = useCallback(() => {
    const newOrder = scans.length > 0 
      ? Math.max(...scans.filter(s => !s.isDeleted).map(s => s.display_order)) + 1 
      : 1;
    
    const newScan: CaseScan = {
      case_id: caseId || 'temp',
      dicom_path: null,
      label: 'AP', // Default to AP instead of View X
      display_order: newOrder,
      isNew: true
    };
    
    setScans(prevScans => [...prevScans, newScan]);
    
    // Show info toast
    toast({
      title: "New scan added",
      description: "Upload a DICOM file for this scan",
    });
  }, [scans, caseId]);

  // Delete a scan
  const deleteScan = useCallback((scanIndex: number) => {
    setScans(prevScans => {
      const updatedScans = [...prevScans];
      
      // If scan has an ID (exists in DB), mark as deleted
      if (updatedScans[scanIndex].id) {
        updatedScans[scanIndex] = {
          ...updatedScans[scanIndex],
          isDeleted: true
        };
      } else {
        // If scan doesn't exist in DB yet, remove it from array
        updatedScans.splice(scanIndex, 1);
      }
      
      return updatedScans;
    });
  }, []);

  // Move scan up or down in order
  const moveScan = useCallback((scanIndex: number, direction: 'up' | 'down') => {
    setScans(prevScans => {
      const visibleScans = prevScans.filter(scan => !scan.isDeleted);
      const updatedScans = [...prevScans];
      
      const currentScan = updatedScans[scanIndex];
      const currentOrder = currentScan.display_order;
      
      let targetScan;
      let targetIndex;
      
      if (direction === 'up') {
        // Find the scan with the closest lower display_order
        targetScan = visibleScans
          .filter(scan => scan.display_order < currentOrder)
          .sort((a, b) => b.display_order - a.display_order)[0];
      } else {
        // Find the scan with the closest higher display_order
        targetScan = visibleScans
          .filter(scan => scan.display_order > currentOrder)
          .sort((a, b) => a.display_order - b.display_order)[0];
      }
      
      if (!targetScan) return prevScans; // No target found
      
      // Find index of target scan
      targetIndex = updatedScans.findIndex(scan => 
        scan.id ? scan.id === targetScan.id : scan.display_order === targetScan.display_order
      );
      
      // Swap display orders
      const targetOrder = targetScan.display_order;
      updatedScans[scanIndex].display_order = targetOrder;
      updatedScans[targetIndex].display_order = currentOrder;
      
      // Mark both scans as modified
      updatedScans[scanIndex].isNew = true;
      updatedScans[targetIndex].isNew = true;
      
      return updatedScans;
    });
  }, []);

  // Get only the visible scans (not marked as deleted)
  const visibleScans = scans.filter(scan => !scan.isDeleted);

  // Prepare scans data for parent component
  const getScansForSubmit = useCallback(() => {
    return scans.map(scan => ({
      ...scan,
      case_id: caseId || 'temp' // Will be replaced with actual case ID when saving
    }));
  }, [scans, caseId]);

  const isStandardLabel = (label: string) => {
    return STANDARD_LABELS.includes(label);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <Card className="border-gray-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex justify-between items-center">
          <span>Case Scans</span>
          <Button 
            size="sm" 
            onClick={addScan}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Scan
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {visibleScans.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>No scans added yet.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={addScan}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Your First Scan
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {visibleScans
              .sort((a, b) => a.display_order - b.display_order)
              .map((scan, index) => {
                const actualIndex = scans.findIndex(s => 
                  s.id ? s.id === scan.id : s.display_order === scan.display_order
                );
                
                return (
                  <div 
                    key={scan.id || `new-scan-${index}`} 
                    className="p-4 border border-gray-300 rounded-md"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">Scan {scan.display_order}</h3>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => moveScan(actualIndex, 'up')}
                          disabled={scan.display_order === Math.min(...visibleScans.map(s => s.display_order))}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => moveScan(actualIndex, 'down')}
                          disabled={scan.display_order === Math.max(...visibleScans.map(s => s.display_order))}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          onClick={() => deleteScan(actualIndex)}
                          disabled={visibleScans.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Changed from grid to vertical stack layout */}
                    <div className="flex flex-col space-y-4">
                      <div>
                        <Label htmlFor={`scan-label-${index}`}>Label</Label>
                        {isStandardLabel(scan.label) ? (
                          <Select value={scan.label} onValueChange={(value) => handleLabelChange(actualIndex, value)}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select view type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AP">AP</SelectItem>
                              <SelectItem value="Lateral">Lateral</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div>
                            <Input 
                              id={`scan-label-${index}`}
                              value={scan.label} 
                              readOnly
                              className="w-full bg-gray-50 cursor-not-allowed"
                              title="Legacy label - cannot be changed"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Legacy label. New scans use standardized labels.
                            </p>
                          </div>
                        )}
                      </div>
                      <div>
                        <Label>DICOM File</Label>
                        <DicomUploader 
                          currentPath={scan.dicom_path} 
                          onUploadComplete={(path) => handleDicomUpload(actualIndex, path)}
                          isTemporaryUpload={isNewCase}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
        
        <div className="text-xs text-gray-500 mt-4">
          <p>* You can upload multiple DICOM files and label each one (AP or Lateral)</p>
          <p>* The first scan in the list will be shown by default when users view the case</p>
        </div>
      </CardContent>
    </Card>
  );
};
