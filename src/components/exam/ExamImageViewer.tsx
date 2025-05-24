import React from 'react';
import { ThumbnailDicomViewer } from './ThumbnailDicomViewer';
import { getSignedUrl } from '@/utils/dicomStorage';
import { useState, useEffect } from 'react';

interface ExamCase {
  id: string;
  case_number: string;
  title: string;
  clinical_history: string | null;
  dicom_path: string | null;
}

interface ExamImageViewerProps {
  caseNumber: number;
  caseData: ExamCase | null;
  isLoading: boolean;
}

export const ExamImageViewer: React.FC<ExamImageViewerProps> = ({ 
  caseNumber, 
  caseData, 
  isLoading 
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    const loadImageUrl = async () => {
      if (caseData?.dicom_path) {
        try {
          const url = await getSignedUrl(caseData.dicom_path);
          setImageUrl(url);
          setImageError(null);
        } catch (error) {
          console.error('Error loading image URL:', error);
          setImageError('Failed to load image');
          setImageUrl(null);
        }
      } else {
        setImageUrl(null);
        setImageError(null);
      }
    };

    loadImageUrl();
  }, [caseData?.dicom_path]);

  // Function to handle thumbnail click (for future expansion)
  const handleThumbnailClick = () => {
    console.log('Thumbnail clicked - will expand DICOM viewer in future');
    // TODO: Implement full DICOM viewer modal/expansion
  };

  // Extract view type from title or use default
  const getViewLabel = () => {
    if (caseData?.title) {
      // Extract view type from title (e.g., "CT Head" -> "CT", "XR Wrist" -> "XR Wrist")
      return caseData.title;
    }
    return 'Medical Image';
  };

  if (isLoading) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-gray-600 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-400 mx-auto mb-4"></div>
          <div className="text-lg">Loading case...</div>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-gray-600 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-lg">No case data available</div>
          <div className="text-sm text-gray-400 mt-2">Case {caseNumber}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Clinical History Section */}
      {caseData.clinical_history && (
        <div className="p-4">
          <p className="text-gray-900 text-base leading-relaxed">
            {caseData.clinical_history}
          </p>
        </div>
      )}
      
      {/* DICOM Thumbnail Section */}
      <div className="flex-1 p-4">
        <div 
          className="bg-gray-300 hover:bg-gray-400 transition-colors duration-200 cursor-pointer rounded-lg p-4 inline-block"
          onClick={handleThumbnailClick}
        >
          {/* View Label */}
          <div className="text-center mb-2">
            <span className="text-gray-700 text-sm font-medium">
              {getViewLabel()}
            </span>
          </div>
          
          {/* DICOM Thumbnail */}
          <div className="w-40 h-40 bg-white border border-gray-400 rounded overflow-hidden">
            {imageUrl ? (
              <ThumbnailDicomViewer
                imageUrl={imageUrl}
                alt={`Case ${caseNumber}`}
                className="w-full h-full"
                instanceId={`exam-case-${caseNumber}`}
                onError={(error) => {
                  console.error('DICOM viewer error:', error);
                  setImageError(error.message);
                }}
              />
            ) : imageError ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-red-400 text-lg mb-2">⚠️</div>
                  <div className="text-gray-600 text-xs">{imageError}</div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-gray-400 text-lg mb-2">📄</div>
                  <div className="text-gray-400 text-xs">No image available</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
