
import React from 'react';

interface ExamCase {
  id: string;
  case_number: string;
  title: string;
  clinical_history: string | null;
  dicom_path: string | null;
}

interface CaseHeaderProps {
  caseNumber: number;
  caseData?: ExamCase | null;
  isLoading?: boolean;
}

export const CaseHeader: React.FC<CaseHeaderProps> = ({ 
  caseNumber, 
  caseData, 
  isLoading = false 
}) => {
  return (
    <div className="bg-gray-800 text-white p-3 text-left">
      <h2 className="text-sm font-medium uppercase tracking-wide">
        Case {caseNumber}
        {!isLoading && caseData && (
          <span className="text-gray-400 ml-2 normal-case">
            - {caseData.title}
          </span>
        )}
      </h2>
    </div>
  );
};
