
import { Button } from "@/components/ui/button";
import { ArrowLeft, Contrast, RotateCw, ZoomIn, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";

interface CaseViewerToolbarProps {
  onToolChange: (tool: string) => void;
  onReset: () => void;
  activeTool: string;
}

export const CaseViewerToolbar = ({ onToolChange, onReset, activeTool }: CaseViewerToolbarProps) => {
  const navigate = useNavigate();

  console.log("CaseViewerToolbar: Rendering with active tool:", activeTool);

  const handleBack = () => {
    console.log("CaseViewerToolbar: Navigating back to cases list");
    navigate("/cases");
  };

  return (
    <div className="flex items-center justify-between bg-gray-800 p-2 rounded-t-md">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="text-white hover:bg-gray-700"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Cases
        </Button>
      </div>

      <TooltipProvider>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === "contrast" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => {
                  console.log("CaseViewerToolbar: Window/Contrast tool selected");
                  onToolChange("contrast");
                }}
                className="text-white hover:bg-gray-700"
              >
                <Contrast className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Window/Contrast (W)</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === "rotate" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => {
                  console.log("CaseViewerToolbar: Rotate tool selected");
                  onToolChange("rotate");
                }}
                className="text-white hover:bg-gray-700"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Rotate (R)</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === "zoom" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => {
                  console.log("CaseViewerToolbar: Zoom tool selected");
                  onToolChange("zoom");
                }}
                className="text-white hover:bg-gray-700"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Zoom (Z)</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log("CaseViewerToolbar: Reset view");
                  onReset();
                }}
                className="text-white hover:bg-gray-700"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Reset View (Esc)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
};
