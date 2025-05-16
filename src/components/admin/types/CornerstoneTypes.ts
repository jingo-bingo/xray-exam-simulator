
// Define custom interface for cornerstone tool events
export interface CornerstoneToolsEvent extends Event {
  detail?: {
    element: HTMLElement;
    currentPoints: {
      canvas: { x: number; y: number };
      image: { x: number; y: number };
    };
  };
}

export interface DicomViewerProps {
  imageUrl: string;
  alt: string;
  className?: string;
  onError?: (error: Error) => void;
  onMetadataLoaded?: (metadata: any) => void;
}
