
import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ZoomIn, MoveHorizontal, Move, RotateCcw } from "lucide-react";
import { ToolMode } from "@/hooks/useCornerStoneTools";

interface DicomToolbarProps {
  activeTool: ToolMode;
  onToolSelect: (tool: ToolMode) => void;
  onReset: () => void;
  className?: string;
}

export const DicomToolbar: React.FC<DicomToolbarProps> = ({
  activeTool,
  onToolSelect,
  onReset,
  className = "",
}) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === "zoom" ? "default" : "outline"}
              size="sm"
              className={`bg-opacity-75 ${
                activeTool === "zoom" ? "bg-primary" : "bg-gray-700"
              }`}
              onClick={() => onToolSelect("zoom")}
            >
              <ZoomIn />
              <span className="sr-only">Zoom</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Zoom Tool (Click + Drag)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === "pan" ? "default" : "outline"}
              size="sm"
              className={`bg-opacity-75 ${
                activeTool === "pan" ? "bg-primary" : "bg-gray-700"
              }`}
              onClick={() => onToolSelect("pan")}
            >
              <MoveHorizontal />
              <span className="sr-only">Pan</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Pan Tool (Click + Drag)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === "windowLevel" ? "default" : "outline"}
              size="sm"
              className={`bg-opacity-75 ${
                activeTool === "windowLevel" ? "bg-primary" : "bg-gray-700"
              }`}
              onClick={() => onToolSelect("windowLevel")}
            >
              <Move />
              <span className="sr-only">Window Level</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Window Level Tool (Adjust Brightness/Contrast)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-700 bg-opacity-75"
              onClick={onReset}
            >
              <RotateCcw />
              <span className="sr-only">Reset View</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reset Image View</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
