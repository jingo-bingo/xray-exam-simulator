
import { DicomViewer } from "@/components/admin/DicomViewer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Image } from "lucide-react";

interface DicomSectionProps {
  signedDicomUrl: string | null;
  dicomError: string | null;
  isGeneratingUrl: boolean;
  caseTitle?: string;
  dicomPath?: string;
  setDicomError: (error: string | null) => void;
}

export const DicomSection = ({ 
  signedDicomUrl, 
  dicomError, 
  isGeneratingUrl,
  caseTitle,
  dicomPath,
  setDicomError 
}: DicomSectionProps) => {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-radiology-light flex items-center">
          <Image className="mr-2 h-5 w-5" />
          DICOM Image
        </CardTitle>
        {dicomError && (
          <CardDescription className="text-red-400">
            Error: {dicomError}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="relative w-full aspect-square max-h-[600px] bg-black">
          {signedDicomUrl ? (
            <DicomViewer 
              imageUrl={signedDicomUrl}
              alt={`DICOM for case ${caseTitle}`}
              className="w-full aspect-square max-h-[600px] bg-black"
              onError={(error) => {
                console.error("CaseView: DICOM viewer error:", error);
                setDicomError("Failed to load the DICOM image");
                toast({
                  title: "Image Error",
                  description: "Failed to load the DICOM image",
                  variant: "destructive",
                });
              }}
            />
          ) : (
            <div className="w-full aspect-square max-h-[600px] bg-black flex items-center justify-center text-gray-400">
              {isGeneratingUrl ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-400 mb-2"></div>
                  <div>Preparing DICOM image...</div>
                </div>
              ) : (
                dicomError ? 
                  "Error loading DICOM image" : 
                  (dicomPath ? "Loading DICOM image..." : "No DICOM image available for this case")
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
