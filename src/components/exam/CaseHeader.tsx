
import React from 'react';

interface CaseHeaderProps {
  caseNumber: number;
}

export const CaseHeader: React.FC<CaseHeaderProps> = ({ caseNumber }) => {
  return (
    <div className="bg-gray-800 text-white p-3 text-left">
      <h2 className="text-sm font-medium uppercase tracking-wide">
        Case {caseNumber}
      </h2>
    </div>
  );
};
