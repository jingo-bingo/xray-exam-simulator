
import React from 'react';

interface CaseNavigationProps {
  currentCase: number;
  totalCases: number;
  completedCases: Set<number>;
  onCaseSelect: (caseNumber: number) => void;
}

export const CaseNavigation: React.FC<CaseNavigationProps> = ({
  currentCase,
  totalCases,
  completedCases,
  onCaseSelect
}) => {
  return (
    <div className="w-20 bg-gray-100 border-r border-gray-300 flex flex-col">
      {/* Overview tab */}
      <div className="p-2 bg-blue-600 text-white text-center text-sm font-medium">
        Overview
      </div>
      
      {/* Case numbers */}
      <div className="flex-1 p-2">
        <div className="grid grid-cols-2 gap-1">
          {Array.from({ length: totalCases }, (_, i) => i + 1).map((caseNumber) => {
            const isCompleted = completedCases.has(caseNumber);
            const isCurrent = caseNumber === currentCase;
            const isAccessible = caseNumber <= currentCase;
            
            return (
              <button
                key={caseNumber}
                onClick={() => onCaseSelect(caseNumber)}
                disabled={!isAccessible}
                className={`
                  w-8 h-8 text-xs font-medium rounded border
                  ${isCurrent 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : isCompleted
                    ? 'bg-green-500 text-white border-green-500'
                    : isAccessible
                    ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    : 'bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed'
                  }
                `}
              >
                {caseNumber}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
