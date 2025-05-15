
import React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Move, ArrowLeft, RefreshCw } from 'lucide-react';
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
  if (!isToolsEnabled) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 p-2 bg-gray-900 rounded-md mb-2">
      {error ? (
        <div className="text-red-400 text-sm flex-1">{error}</div>
      ) : (
        <>
          <Button
            variant={activeTool === 'Zoom' ? "default" : "outline"}
            size="sm"
            onClick={() => onActivateTool('Zoom')}
            className="text-xs"
            title="Zoom Tool"
          >
            <ZoomIn className="h-4 w-4 mr-1" />
            Zoom
          </Button>
          
          <Button
            variant={activeTool === 'Pan' ? "default" : "outline"}
            size="sm"
            onClick={() => onActivateTool('Pan')}
            className="text-xs"
            title="Pan Tool"
          >
            <Move className="h-4 w-4 mr-1" />
            Pan
          </Button>
          
          <Button
            variant={activeTool === 'Wwwc' ? "default" : "outline"}
            size="sm"
            onClick={() => onActivateTool('Wwwc')}
            className="text-xs"
            title="Window Level Tool"
          >
            <ZoomOut className="h-4 w-4 mr-1" />
            Window
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onResetView}
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
