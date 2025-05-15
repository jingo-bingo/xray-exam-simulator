
import { Button } from "@/components/ui/button";
import { ArrowLeft, ZoomIn, ZoomOut, Move, Maximize } from "lucide-react";
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
        >
          <Move className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === "zoomIn" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => {
            console.log("CaseViewerToolbar: Zoom in tool selected");
            onToolChange("zoomIn");
          }}
          className="text-white hover:bg-gray-700"
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
        >
          <Maximize className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
