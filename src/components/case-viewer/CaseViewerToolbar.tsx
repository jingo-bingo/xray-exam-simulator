
import { Button } from "@/components/ui/button";
import { ArrowLeft, Contrast, RotateCw, ZoomIn, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

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

  const handleReset = () => {
    console.log("CaseViewerToolbar: Reset view requested");
    onReset();
    toast({
      title: "View Reset",
      description: "Image view has been reset to default",
    });
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
          variant={activeTool === "contrast" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => {
            console.log("CaseViewerToolbar: Contrast/Window tool selected");
            onToolChange("contrast");
          }}
          className="text-white hover:bg-gray-700"
          title="Window/Contrast"
        >
          <Contrast className="h-4 w-4" />
          <span className="sr-only md:not-sr-only md:ml-2">Window</span>
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
          <span className="sr-only md:not-sr-only md:ml-2">Rotate</span>
        </Button>
        
        <Button
          variant={activeTool === "zoom" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => {
            console.log("CaseViewerToolbar: Zoom tool selected");
            onToolChange("zoom");
          }}
          className="text-white hover:bg-gray-700"
          title="Zoom"
        >
          <ZoomIn className="h-4 w-4" />
          <span className="sr-only md:not-sr-only md:ml-2">Zoom</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-white hover:bg-gray-700"
          title="Reset View"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only md:not-sr-only md:ml-2">Reset</span>
        </Button>
      </div>
    </div>
  );
};
