
import React from 'react';

interface ExamCase {
  id: string;
  case_number: string;
  title: string;
  clinical_history: string | null;
  dicom_path: string | null;
}

interface CaseHeaderProps {
  examCase: ExamCase | null;
  isLoading: boolean;
}

export const CaseHeader: React.FC<CaseHeaderProps> = ({ examCase, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-gray-800 text-white p-3 text-left">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-600 rounded w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 text-white p-3 text-left">
      <h2 className="text-sm font-medium uppercase tracking-wide">
        {examCase ? `Case ${examCase.case_number}` : 'No Case'}
      </h2>
      {examCase?.title && (
        <p className="text-xs text-gray-300 mt-1">{examCase.title}</p>
      )}
    </div>
  );
};
