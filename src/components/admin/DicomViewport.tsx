
import { forwardRef, useEffect, useRef } from "react";
import cornerstone from "cornerstone-core";
import { setupTrackpadSupport, setupEventLogging } from "@/utils/dicomEventHandlers";

interface DicomViewportProps {
  isLoading: boolean;
  error: string | null;
  imageUrl: string | null;
  onElementEnabled?: (element: HTMLDivElement) => void;
  className?: string;
}

export const DicomViewport = forwardRef<HTMLDivElement, DicomViewportProps>(
  ({ isLoading, error, imageUrl, onElementEnabled, className }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);
    
    // Forward ref handling - use the forwarded ref if provided, otherwise use internal
    const elementRef = (ref || internalRef) as React.RefObject<HTMLDivElement>;
    
    // Enable cornerstone on the element when it's available
    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;
      
      try {
        console.log("DicomViewport: Enabling cornerstone on element");
        cornerstone.enable(element);
        console.log("DicomViewport: Cornerstone enabled on element");
        
        // Configure the element for better trackpad support
        setupTrackpadSupport(element);
        
        // Set up event logging
        setupEventLogging(element);
        
        // Notify parent that element is enabled and ready
        if (onElementEnabled) {
          onElementEnabled(element);
        }
        
        // Cleanup function
        return () => {
          try {
            console.log("DicomViewport: Cleaning up cornerstone element");
            cornerstone.disable(element);
          } catch (error) {
            console.warn("DicomViewport: Error during cleanup:", error);
          }
        };
      } catch (error) {
        console.error("DicomViewport: Error enabling cornerstone:", error);
        return;
      }
    }, [elementRef, onElementEnabled]);

    return (
      <div className="dicom-viewport-container relative w-full h-full">
        <div 
          ref={elementRef} 
          className={`w-full h-full ${className || ""} focus:outline-none`}
          data-testid="dicom-viewport"
          tabIndex={0}
        >
          {isLoading && (
            <div className="flex items-center justify-center h-full text-white bg-opacity-70 bg-black absolute inset-0 z-10">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mb-2"></div>
                <div>Loading DICOM image...</div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center h-full text-red-400 bg-opacity-70 bg-black absolute inset-0 z-10">
              <div className="text-center p-4">
                <div className="font-bold mb-2">Error</div>
                <div>{error}</div>
              </div>
            </div>
          )}
          
          {!imageUrl && !isLoading && !error && (
            <div className="flex items-center justify-center h-full text-white">
              No image available
            </div>
          )}
        </div>
      </div>
    );
  }
);

DicomViewport.displayName = "DicomViewport";
