
import { Label } from "@/components/ui/label";
import { DicomUploader } from "../DicomUploader";
import { ScanLabelSelector } from "./ScanLabelSelector";
import { ScanControls } from "./ScanControls";
import { CaseScan } from "../ScanManager";

interface ScanCardProps {
  scan: CaseScan;
  index: number;
  actualIndex: number;
  minOrder: number;
  maxOrder: number;
  canDelete: boolean;
  isNewCase: boolean;
  onLabelChange: (actualIndex: number, label: string) => void;
  onDicomUpload: (actualIndex: number, path: string) => void;
  onMoveUp: (actualIndex: number) => void;
  onMoveDown: (actualIndex: number) => void;
  onDelete: (actualIndex: number) => void;
}

const STANDARD_LABELS = ["Lateral", "AP"];

export const ScanCard = ({
  scan,
  index,
  actualIndex,
  minOrder,
  maxOrder,
  canDelete,
  isNewCase,
  onLabelChange,
  onDicomUpload,
  onMoveUp,
  onMoveDown,
  onDelete
}: ScanCardProps) => {
  const isStandardLabel = (label: string) => {
    return STANDARD_LABELS.includes(label);
  };

  return (
    <div className="p-4 border border-gray-300 rounded-md">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">Scan {scan.display_order}</h3>
        <ScanControls
          scanIndex={index}
          displayOrder={scan.display_order}
          minOrder={minOrder}
          maxOrder={maxOrder}
          canDelete={canDelete}
          onMoveUp={() => onMoveUp(actualIndex)}
          onMoveDown={() => onMoveDown(actualIndex)}
          onDelete={() => onDelete(actualIndex)}
        />
      </div>
      
      <div className="flex flex-col space-y-4">
        <ScanLabelSelector
          label={scan.label}
          scanIndex={index}
          isStandardLabel={isStandardLabel}
          onLabelChange={(label) => onLabelChange(actualIndex, label)}
        />
        <div>
          <Label>DICOM File</Label>
          <DicomUploader 
            currentPath={scan.dicom_path} 
            onUploadComplete={(path) => onDicomUpload(actualIndex, path)}
            isTemporaryUpload={isNewCase}
          />
        </div>
      </div>
    </div>
  );
};
