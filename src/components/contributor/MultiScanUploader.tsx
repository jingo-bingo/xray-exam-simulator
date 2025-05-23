
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DicomUploader } from "@/components/admin/DicomUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, MoveUp, MoveDown } from "lucide-react";

export interface CaseScan {
  id?: string;
  dicom_path: string;
  label: string;
  display_order: number;
  isNew?: boolean;
  isDeleted?: boolean;
}

interface MultiScanUploaderProps {
  scans: CaseScan[];
  onScansChange: (scans: CaseScan[]) => void;
  isTemporaryUpload?: boolean;
}

export const MultiScanUploader = ({ 
  scans, 
  onScansChange, 
  isTemporaryUpload = false 
}: MultiScanUploaderProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addNewScan = () => {
    const newScan: CaseScan = {
      dicom_path: "",
      label: `View ${scans.length + 1}`,
      display_order: scans.length + 1,
      isNew: true
    };
    onScansChange([...scans, newScan]);
  };

  const removeScan = (index: number) => {
    const updatedScans = scans.filter((_, i) => i !== index);
    // Reorder the remaining scans
    const reorderedScans = updatedScans.map((scan, i) => ({
      ...scan,
      display_order: i + 1
    }));
    onScansChange(reorderedScans);
  };

  const updateScanLabel = (index: number, label: string) => {
    const updatedScans = [...scans];
    updatedScans[index] = { ...updatedScans[index], label };
    onScansChange(updatedScans);
  };

  const updateScanPath = (index: number, dicom_path: string) => {
    const updatedScans = [...scans];
    updatedScans[index] = { ...updatedScans[index], dicom_path };
    onScansChange(updatedScans);
  };

  const moveScan = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === scans.length - 1)) {
      return;
    }
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedScans = [...scans];
    [updatedScans[index], updatedScans[newIndex]] = [updatedScans[newIndex], updatedScans[index]];
    
    // Update display orders
    updatedScans.forEach((scan, i) => {
      scan.display_order = i + 1;
    });
    
    onScansChange(updatedScans);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-base font-semibold">DICOM Images</Label>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={addNewScan}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add View
        </Button>
      </div>

      {scans.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <p className="mb-2">No DICOM images added yet.</p>
              <p className="text-sm">Click "Add View" to upload your first DICOM image.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {scans.map((scan, index) => (
        <Card key={index} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                View {index + 1}
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => moveScan(index, 'up')}
                  disabled={index === 0}
                  className="h-8 w-8 p-0"
                >
                  <MoveUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => moveScan(index, 'down')}
                  disabled={index === scans.length - 1}
                  className="h-8 w-8 p-0"
                >
                  <MoveDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeScan(index)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor={`scan-label-${index}`} className="text-sm">
                View Label
              </Label>
              <Input
                id={`scan-label-${index}`}
                value={scan.label}
                onChange={(e) => updateScanLabel(index, e.target.value)}
                placeholder="e.g., Frontal View, Lateral View, Axial"
                className="mt-1"
              />
            </div>
            
            <DicomUploader
              currentPath={scan.dicom_path}
              onUploadComplete={(filePath) => updateScanPath(index, filePath)}
              isTemporaryUpload={isTemporaryUpload}
            />
          </CardContent>
        </Card>
      ))}

      {scans.length > 0 && (
        <p className="text-sm text-gray-500">
          At least one DICOM image is required to submit a case.
        </p>
      )}
    </div>
  );
};
