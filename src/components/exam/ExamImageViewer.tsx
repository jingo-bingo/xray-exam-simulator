
import React from 'react';
import { BasicDicomViewer } from '@/components/case/BasicDicomViewer';
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

  if (isLoading) {
    return (
      <div className="h-full bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-lg">Loading case...</div>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="h-full bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-lg">No case data available</div>
          <div className="text-sm text-gray-400 mt-2">Case {caseNumber}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-black flex flex-col">
      {/* Clinical History Section */}
      {caseData.clinical_history && (
        <div className="bg-gray-800 p-4 border-b border-gray-600">
          <h3 className="text-white text-sm font-medium mb-2 uppercase tracking-wide">
            Clinical History
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            {caseData.clinical_history}
          </p>
        </div>
      )}
      
      {/* DICOM Image Section */}
      <div className="flex-1 p-4">
        <div className="h-full bg-gray-500 rounded flex items-center justify-center">
          {imageUrl ? (
            <div className="w-full h-full">
              <BasicDicomViewer
                imageUrl={imageUrl}
                alt={`Case ${caseNumber} - ${caseData.title}`}
                className="w-full h-full"
                instanceId={`exam-case-${caseNumber}`}
                onError={(error) => {
                  console.error('DICOM viewer error:', error);
                  setImageError(error.message);
                }}
              />
            </div>
          ) : imageError ? (
            <div className="text-center">
              <div className="text-red-400 text-lg mb-2">⚠️</div>
              <div className="text-white text-sm">{imageError}</div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-gray-300 text-lg mb-2">📄</div>
              <div className="text-gray-300 text-sm">No image available</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Image controls overlay */}
      <div className="absolute bottom-4 left-4 flex space-x-2">
        <button className="bg-gray-800 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
          W/L
        </button>
        <button className="bg-gray-800 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
          Zoom
        </button>
        <button className="bg-gray-800 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
          Pan
        </button>
        <button className="bg-gray-800 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
          Reset
        </button>
      </div>
    </div>
  );
};
