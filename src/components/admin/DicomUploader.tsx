
import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { DicomDropzone } from "./DicomDropzone";
import { DicomPreview } from "./DicomPreview";
import { useDicomUpload } from "@/hooks/useDicomUpload";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface DicomUploaderProps {
  currentPath: string | null;
  onUploadComplete: (filePath: string) => void;
}

export const DicomUploader = ({ currentPath, onUploadComplete }: DicomUploaderProps) => {
  const {
    filePath,
    uploading,
    validationError,
    setFilePath,
    handleFileUpload,
    handleRemoveFile
  } = useDicomUpload(onUploadComplete, null);
  
  // Sync filePath with currentPath when component mounts or currentPath changes
  useEffect(() => {
    console.log("DicomUploader: Initial useEffect triggered with currentPath:", currentPath);
    if (currentPath && currentPath !== filePath) {
      console.log("DicomUploader: Setting filePath from currentPath:", currentPath);
      setFilePath(currentPath);
    }
  }, [currentPath, filePath, setFilePath]);
  
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
    </div>
  );
};
