
import React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Move, RefreshCw, Maximize } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DicomToolbarProps {
  isToolsEnabled: boolean;
  activeTool: string | null;
  zoomLevel: number;
  onActivateTool: (toolName: string) => void;
  onResetView: () => void;
  error: string | null;
}

export const DicomToolbar: React.FC<DicomToolbarProps> = ({
  isToolsEnabled,
  activeTool,
  zoomLevel,
  onActivateTool,
  onResetView,
  error
}) => {
  console.log("DicomToolbar: Rendering with activeTool:", activeTool, "isToolsEnabled:", isToolsEnabled);
  
  if (!isToolsEnabled) {
    console.log("DicomToolbar: Tools not enabled, not rendering toolbar");
    return null;
  }

  const handleToolClick = (toolName: string) => {
    console.log(`DicomToolbar: Tool button clicked: ${toolName}`);
    onActivateTool(toolName);
  };

  const handleResetClick = () => {
    console.log("DicomToolbar: Reset button clicked");
    onResetView();
  };

  return (
    <div className="flex items-center space-x-2 p-2 bg-gray-900 rounded-md mb-2">
      {error ? (
        <div className="text-red-400 text-sm flex-1">{error}</div>
      ) : (
        <>
          <Button
            variant={activeTool === 'Zoom' ? "default" : "outline"}
            size="sm"
            onClick={() => handleToolClick('Zoom')}
            className="text-xs"
            title="Zoom Tool"
          >
            <ZoomIn className="h-4 w-4 mr-1" />
            Zoom
          </Button>
          
          <Button
            variant={activeTool === 'Pan' ? "default" : "outline"}
            size="sm"
            onClick={() => handleToolClick('Pan')}
            className="text-xs"
            title="Pan Tool"
            data-testid="pan-tool-button"
          >
            <Move className="h-4 w-4 mr-1" />
            Pan
          </Button>
          
          <Button
            variant={activeTool === 'Wwwc' ? "default" : "outline"}
            size="sm"
            onClick={() => handleToolClick('Wwwc')}
            className="text-xs"
            title="Window Level Tool"
          >
            <ZoomOut className="h-4 w-4 mr-1" />
            Window
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetClick}
            className="text-xs"
            title="Reset View"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          
          <div className="ml-auto">
            <Badge variant="outline" className="text-xs">
              Zoom: {zoomLevel}%
            </Badge>
          </div>
        </>
      )}
    </div>
  );
};
