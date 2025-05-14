
import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

interface DicomDropzoneProps {
  onFileSelected: (file: File) => void;
}

export const DicomDropzone = ({ onFileSelected }: DicomDropzoneProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <Input 
        ref={fileInputRef}
        type="file" 
        accept=".dcm,.dicom,image/*" 
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div 
        className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-gray-50"
        onClick={triggerFileInput}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">
          Click to upload a DICOM image
        </p>
        <p className="text-xs text-gray-400">
          (or any image file for preview purposes)
        </p>
      </div>
    </>
  );
};
