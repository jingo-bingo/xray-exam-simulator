
import React from 'react';

interface ExamImageViewerProps {
  caseNumber: number;
}

export const ExamImageViewer: React.FC<ExamImageViewerProps> = ({ caseNumber }) => {
  return (
    <div className="h-full bg-black flex items-center justify-center relative">
      {/* Placeholder for DICOM viewer */}
      <div className="text-white text-center">
        <div className="text-6xl mb-4">🔲</div>
        <div className="text-lg">DICOM Image Viewer</div>
        <div className="text-sm text-gray-400 mt-2">Case {caseNumber}</div>
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
