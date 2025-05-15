
import { Button } from "@/components/ui/button";
import { ArrowLeft, ZoomIn, ZoomOut, Move, Maximize, RotateCw, Contrast } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

      <div className="flex items-center gap-2">
        <Button
          variant={activeTool === "pan" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => {
            console.log("CaseViewerToolbar: Pan tool selected");
            onToolChange("pan");
          }}
          className="text-white hover:bg-gray-700"
          title="Pan"
        >
          <Move className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === "contrast" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => {
            console.log("CaseViewerToolbar: Contrast tool selected");
            onToolChange("contrast");
          }}
          className="text-white hover:bg-gray-700"
          title="Adjust Contrast"
        >
          <Contrast className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === "rotate" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => {
            console.log("CaseViewerToolbar: Rotate tool selected");
            onToolChange("rotate");
          }}
          className="text-white hover:bg-gray-700"
          title="Rotate"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === "zoomIn" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => {
            console.log("CaseViewerToolbar: Zoom in tool selected");
            onToolChange("zoomIn");
          }}
          className="text-white hover:bg-gray-700"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === "zoomOut" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => {
            console.log("CaseViewerToolbar: Zoom out tool selected");
            onToolChange("zoomOut");
          }}
          className="text-white hover:bg-gray-700"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            console.log("CaseViewerToolbar: Reset view");
            onReset();
          }}
          className="text-white hover:bg-gray-700"
          title="Reset View"
        >
          <Maximize className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
