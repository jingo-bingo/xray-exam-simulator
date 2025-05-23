
import React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Move, RefreshCw, RotateCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CornerstoneTool } from '@/hooks/cornerstone/types';

interface DicomToolbarProps {
  isToolsEnabled: boolean;
  activeTool: CornerstoneTool | null;
  zoomLevel: number;
  onActivateTool: (toolName: CornerstoneTool) => void;
  onResetView: () => void;
  error: string | null;
}

// Define the styles for button click animation
const clickAnimationStyle = `
  .toolbar-button-clicked {
    transform: scale(0.95);
    opacity: 0.8;
    transition: transform 0.1s, opacity 0.1s;
  }
`;

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

  const handleToolClick = (toolName: CornerstoneTool) => {
    console.log(`DicomToolbar: Tool button clicked: ${toolName}`);
    
    // Provide visual feedback before calling the handler
    const activeButton = document.querySelector(`[data-tool="${toolName}"]`);
    if (activeButton) {
      activeButton.classList.add('toolbar-button-clicked');
      setTimeout(() => activeButton.classList.remove('toolbar-button-clicked'), 200);
    }
    
    onActivateTool(toolName);
  };

  const handleResetClick = () => {
    console.log("DicomToolbar: Reset button clicked");
    onResetView();
  };

  // Simple function to determine button variant based on active tool
  const getButtonVariant = (buttonTool: CornerstoneTool) => {
    return activeTool === buttonTool ? "default" : "outline";
  };

  return (
    <>
      {/* Add the style tag as a regular style element */}
      <style dangerouslySetInnerHTML={{ __html: clickAnimationStyle }} />
      
      <div className="flex items-center space-x-2 p-2 bg-gray-900 rounded-md mb-2 relative">
        {error ? (
          <div className="text-red-400 text-sm flex-1">{error}</div>
        ) : (
          <>
            <Button
              variant={getButtonVariant('Zoom')}
              size="sm"
              onClick={() => handleToolClick('Zoom')}
              className="text-xs relative"
              title="Zoom Tool (Hold and drag up/down)"
              data-tool="Zoom"
            >
              <ZoomIn className="h-4 w-4 mr-1" />
              Zoom
            </Button>
            
            <Button
              variant={getButtonVariant('Pan')}
              size="sm"
              onClick={() => handleToolClick('Pan')}
              className="text-xs relative"
              title="Pan Tool (Hold and drag to move image)"
              data-testid="pan-tool-button"
              data-tool="Pan"
            >
              <Move className="h-4 w-4 mr-1" />
              Pan
            </Button>
            
            <Button
              variant={getButtonVariant('Wwwc')}
              size="sm"
              onClick={() => handleToolClick('Wwwc')}
              className="text-xs relative"
              title="Window Level Tool (Hold and drag to adjust brightness/contrast)"
              data-tool="Wwwc"
            >
              <ZoomOut className="h-4 w-4 mr-1" />
              Window
            </Button>
            
            <Button
              variant={getButtonVariant('Rotate')}
              size="sm"
              onClick={() => handleToolClick('Rotate')}
              className="text-xs relative"
              title="Rotation Tool (Hold and drag to rotate image)"
              data-tool="Rotate"
            >
              <RotateCw className="h-4 w-4 mr-1" />
              Rotate
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetClick}
              className="text-xs relative"
              title="Reset View"
              data-tool="Reset"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            
            <div className="ml-auto">
              <Badge variant="outline" className="text-xs">
                Zoom: {Math.round(zoomLevel * 100)}%
              </Badge>
            </div>
            
            <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-gray-400">
              Using trackpad? Hold Ctrl+scroll for zoom, regular scroll for pan.
            </div>
          </>
        )}
      </div>
    </>
  );
};
