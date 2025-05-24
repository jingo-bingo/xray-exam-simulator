
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
          <p className="text-gray-900 text-sm leading-relaxed">
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
                alt={`Case ${caseNumber}`}
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
    </div>
  );
};
