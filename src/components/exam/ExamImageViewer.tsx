
import React from 'react';
import { BasicDicomViewer } from '@/components/case/BasicDicomViewer';

interface ExamCase {
  id: string;
  case_number: string;
  title: string;
  clinical_history: string | null;
  dicom_path: string | null;
}

interface ExamImageViewerProps {
  examCase: ExamCase | null;
  isLoading: boolean;
}

export const ExamImageViewer: React.FC<ExamImageViewerProps> = ({ examCase, isLoading }) => {
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

  if (!examCase) {
    return (
      <div className="h-full bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-lg">No case available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-black flex flex-col">
      {/* Clinical History Section */}
      {examCase.clinical_history && (
        <div className="bg-gray-800 text-white p-4 border-b border-gray-600">
          <h3 className="text-sm font-medium uppercase tracking-wide mb-2">Clinical History</h3>
          <p className="text-sm leading-relaxed">{examCase.clinical_history}</p>
        </div>
      )}
      
      {/* DICOM Image Section */}
      <div className="flex-1 p-4">
        <div className="h-full bg-gray-600 border-2 border-gray-500 rounded">
          {examCase.dicom_path ? (
            <BasicDicomViewer
              imageUrl={examCase.dicom_path}
              alt={`DICOM image for ${examCase.title}`}
              className="w-full h-full"
              instanceId={`exam-case-${examCase.id}`}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-300">
              <div className="text-center">
                <div className="text-4xl mb-2">📋</div>
                <div className="text-sm">No image available</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
