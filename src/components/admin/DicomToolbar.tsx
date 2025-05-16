
import React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Move, RefreshCw, RotateCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DicomToolbarProps {
  isToolsEnabled: boolean;
  activeTool: string | null;
  zoomLevel: number;
  onActivateTool: (toolName: string) => void;
  onResetView: () => void;
  error: string | null;
}

// Define the styles for button click animation and tool-specific cursors
const customStyles = `
  .toolbar-button-clicked {
    transform: scale(0.95);
    opacity: 0.8;
    transition: transform 0.1s, opacity 0.1s;
  }
  
  /* Tool-specific cursors */
  .cursor-zoom {
    cursor: zoom-in;
  }
  .cursor-pan {
    cursor: grab;
  }
  .cursor-window {
    cursor: contrast;
  }
  .cursor-rotate {
    cursor: e-resize;
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
    
    // Update cursor on the viewer element
    updateCursorStyle(toolName);
  };

  // Helper to update cursor style based on active tool
  const updateCursorStyle = (toolName: string) => {
    const viewerElement = document.querySelector('.dicom-container > div');
    if (!viewerElement) return;
    
    // Remove all cursor classes
    viewerElement.classList.remove('cursor-zoom', 'cursor-pan', 'cursor-window', 'cursor-rotate');
    
    // Add appropriate cursor class
    switch(toolName) {
      case 'Zoom':
        viewerElement.classList.add('cursor-zoom');
        break;
      case 'Pan':
        viewerElement.classList.add('cursor-pan');
        break;
      case 'Wwwc':
        viewerElement.classList.add('cursor-window');
        break;
      case 'Rotate':
        viewerElement.classList.add('cursor-rotate');
        break;
    }
  };

  const handleResetClick = () => {
    console.log("DicomToolbar: Reset button clicked");
    onResetView();
  };

  // Convert tool names to match what's expected in the cornerstone-tools API
  const getButtonVariant = (buttonTool: string) => {
    if (!activeTool) return "outline";
    
    // Map button tools to cornerstone tool names for comparison
    const toolMapping: Record<string, string> = {
      'Zoom': 'Zoom',
      'Pan': 'Pan',
      'Wwwc': 'Wwwc',
      'Rotate': 'Rotate'
    };
    
    // Update cursor when component renders with an active tool
    if (activeTool === toolMapping[buttonTool]) {
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => updateCursorStyle(buttonTool), 0);
      return "default"; 
    }
    
    return "outline";
  };

  // Function to get keyboard shortcut for each tool
  const getToolShortcut = (toolName: string): string => {
    switch (toolName) {
      case 'Zoom':
        return "Ctrl+scroll/drag";
      case 'Pan':
        return "scroll/drag";
      case 'Wwwc':
        return "Shift+scroll/drag";
      case 'Rotate':
        return "Alt+scroll/drag";
      default:
        return "";
    }
  };

  return (
    <>
      {/* Add the style tag as a regular style element */}
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      
      <div className="flex items-center space-x-2 p-2 bg-gray-900 rounded-md mb-2 relative">
        {error ? (
          <div className="text-red-400 text-sm flex-1">{error}</div>
        ) : (
          <>
            <Button
              variant={getButtonVariant('Zoom')}
              size="sm"
              onClick={() => handleToolClick('Zoom')}
              className="text-xs relative group"
              title="Zoom Tool (Hold and drag up/down)"
              data-tool="Zoom"
            >
              <ZoomIn className="h-4 w-4 mr-1" />
              Zoom
              <span className="hidden group-hover:block absolute -bottom-8 left-0 right-0 text-center text-xs bg-black bg-opacity-75 p-1 rounded">
                {getToolShortcut('Zoom')}
              </span>
            </Button>
            
            <Button
              variant={getButtonVariant('Pan')}
              size="sm"
              onClick={() => handleToolClick('Pan')}
              className="text-xs relative group"
              title="Pan Tool (Hold and drag to move image)"
              data-testid="pan-tool-button"
              data-tool="Pan"
            >
              <Move className="h-4 w-4 mr-1" />
              Pan
              <span className="hidden group-hover:block absolute -bottom-8 left-0 right-0 text-center text-xs bg-black bg-opacity-75 p-1 rounded">
                {getToolShortcut('Pan')}
              </span>
            </Button>
            
            <Button
              variant={getButtonVariant('Wwwc')}
              size="sm"
              onClick={() => handleToolClick('Wwwc')}
              className="text-xs relative group"
              title="Window Level Tool (Hold and drag to adjust brightness/contrast)"
              data-tool="Wwwc"
            >
              <ZoomOut className="h-4 w-4 mr-1" />
              Window
              <span className="hidden group-hover:block absolute -bottom-8 left-0 right-0 text-center text-xs bg-black bg-opacity-75 p-1 rounded">
                {getToolShortcut('Wwwc')}
              </span>
            </Button>
            
            <Button
              variant={getButtonVariant('Rotate')}
              size="sm"
              onClick={() => handleToolClick('Rotate')}
              className="text-xs relative group"
              title="Rotation Tool (Hold and drag to rotate image)"
              data-tool="Rotate"
            >
              <RotateCw className="h-4 w-4 mr-1" />
              Rotate
              <span className="hidden group-hover:block absolute -bottom-8 left-0 right-0 text-center text-xs bg-black bg-opacity-75 p-1 rounded">
                {getToolShortcut('Rotate')}
              </span>
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
              Mouse: click & drag | Trackpad: gesture or modifier+scroll
            </div>
          </>
        )}
      </div>
    </>
  );
};
