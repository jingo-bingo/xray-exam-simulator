
import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { DicomDropzone } from "./DicomDropzone";
import { DicomPreview } from "./DicomPreview";
import { useDicomUpload, UseDicomUploadOptions } from "@/hooks/useDicomUpload";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface DicomUploaderProps {
  currentPath: string | null;
  onUploadComplete: (filePath: string) => void;
  isTemporaryUpload?: boolean;
}

export const DicomUploader = ({ 
  currentPath, 
  onUploadComplete,
  isTemporaryUpload = false
}: DicomUploaderProps) => {
  const options: UseDicomUploadOptions = {
    isTemporaryUpload
  };

  const {
    filePath,
    uploading,
    validationError,
    fileIsMissing,
    fileCheckComplete,
    setFilePath,
    handleFileUpload,
    handleRemoveFile
  } = useDicomUpload(onUploadComplete, currentPath, options);
  
  // Sync filePath with currentPath when component mounts or currentPath changes
  useEffect(() => {
    console.log("DicomUploader: Initial useEffect triggered with currentPath:", currentPath);
    if (currentPath && currentPath !== filePath) {
      console.log("DicomUploader: Setting filePath from currentPath:", currentPath);
      setFilePath(currentPath);
    }
  }, [currentPath, filePath, setFilePath]);
  
  // Show notification if a file is missing but we have a reference to it
  useEffect(() => {
    if (fileCheckComplete && fileIsMissing && filePath) {
      console.log("DicomUploader: File is missing from storage:", filePath);
      toast({
        title: "File Not Found",
        description: "The DICOM file referenced by this case could not be found in storage.",
        variant: "destructive",
      });
    }
  }, [fileCheckComplete, fileIsMissing, filePath]);
  
  return (
    <div className="space-y-4 border p-4 rounded-md">
      <Label>DICOM Image</Label>
      
      {validationError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}
      
      {!filePath ? (
        <DicomDropzone onFileSelected={handleFileUpload} />
      ) : (
        <DicomPreview 
          filePath={filePath} 
          onRemove={handleRemoveFile} 
        />
      )}
      
      {uploading && (
        <div className="text-sm text-center text-primary">
          Uploading...
        </div>
      )}
      
      {isTemporaryUpload && filePath && (
        <p className="text-xs text-gray-500">
          This file is temporary and will be permanently saved when you save the case.
        </p>
      )}
    </div>
  );
};
