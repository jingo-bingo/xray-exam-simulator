
import React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Move, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DicomToolbarProps {
  isToolsEnabled: boolean;
  activeTool: string | null;
  zoomLevel: number;
  onActivateTool: (toolName: string) => void;
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

  const handleToolClick = (toolName: string) => {
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

  // Direct tool name comparison
  const getButtonVariant = (buttonTool: string) => {
    if (!activeTool) return "outline";
    return activeTool === buttonTool ? "default" : "outline";
  };

  return (
    <>
      {/* Add the style tag for button animations */}
      <style dangerouslySetInnerHTML={{ __html: clickAnimationStyle }} />
      
      <div className="flex items-center space-x-2 p-2 bg-gray-900 rounded-md mb-2">
        {error ? (
          <div className="text-red-400 text-sm flex-1">{error}</div>
        ) : (
          <>
            <Button
              variant={getButtonVariant('Zoom')}
              size="sm"
              onClick={() => handleToolClick('Zoom')}
              className="text-xs relative"
              title="Zoom Tool"
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
              title="Pan Tool"
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
              title="Window Level Tool"
              data-tool="Wwwc"
            >
              <ZoomOut className="h-4 w-4 mr-1" />
              Window
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
          </>
        )}
      </div>
    </>
  );
};
