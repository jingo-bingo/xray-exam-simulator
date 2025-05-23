
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";

interface ScanControlsProps {
  scanIndex: number;
  displayOrder: number;
  minOrder: number;
  maxOrder: number;
  canDelete: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

export const ScanControls = ({
  scanIndex,
  displayOrder,
  minOrder,
  maxOrder,
  canDelete,
  onMoveUp,
  onMoveDown,
  onDelete
}: ScanControlsProps) => {
  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="icon"
        onClick={onMoveUp}
        disabled={displayOrder === minOrder}
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="icon"
        onClick={onMoveDown}
        disabled={displayOrder === maxOrder}
      >
        <ArrowDown className="h-4 w-4" />
      </Button>
      <Button 
        variant="destructive" 
        size="icon"
        onClick={onDelete}
        disabled={!canDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
