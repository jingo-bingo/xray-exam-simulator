
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ScanLabelSelectorProps {
  label: string;
  scanIndex: number;
  isStandardLabel: (label: string) => boolean;
  onLabelChange: (label: string) => void;
}

const STANDARD_LABELS = ["Lateral", "AP"];

export const ScanLabelSelector = ({ 
  label, 
  scanIndex, 
  isStandardLabel, 
  onLabelChange 
}: ScanLabelSelectorProps) => {
  return (
    <div>
      <Label htmlFor={`scan-label-${scanIndex}`}>Label</Label>
      {isStandardLabel(label) ? (
        <Select value={label} onValueChange={onLabelChange}>
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
            id={`scan-label-${scanIndex}`}
            value={label} 
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
  );
};
