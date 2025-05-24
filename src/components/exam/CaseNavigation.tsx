
import React from 'react';
import { Flag } from 'lucide-react';

interface CaseNavigationProps {
  currentCase: number;
  totalCases: number;
  completedCases: Set<number>;
  flaggedCases: Set<number>;
  onCaseSelect: (caseNumber: number) => void;
}

export const CaseNavigation: React.FC<CaseNavigationProps> = ({
  currentCase,
  totalCases,
  completedCases,
  flaggedCases,
  onCaseSelect
}) => {
  return (
    <div className="w-24 bg-white flex flex-col border-r-4 border-gray-300">
      {/* Overview header with left-aligned text */}
      <div className="p-3 bg-gray-800 text-white text-left text-sm font-medium uppercase tracking-wide">
        OVERVIEW
      </div>
      
      {/* Scrollable case numbers section with direct overflow scrolling */}
      <div className="flex-1 bg-white">
        <div className="h-[calc(100vh-140px)] overflow-y-auto">
          <div className="p-2">
            <div className="flex flex-col gap-1">
              {Array.from({ length: totalCases }, (_, i) => i + 1).map((caseNumber) => {
                const isCompleted = completedCases.has(caseNumber);
                const isCurrent = caseNumber === currentCase;
                const isFlagged = flaggedCases.has(caseNumber);
                
                return (
                  <button
                    key={caseNumber}
                    onClick={() => onCaseSelect(caseNumber)}
                    className={`
                      w-full h-8 text-xs font-medium text-left px-2 flex items-center justify-between
                      ${isCurrent 
                        ? 'bg-blue-500 text-white' 
                        : isCompleted
                        ? 'bg-green-800 text-white'
                        : 'text-gray-700 hover:bg-gray-200'
                      }
                      transition-colors duration-150
                    `}
                  >
                    <span>{caseNumber}</span>
                    {isFlagged && (
                      <Flag className="h-3 w-3" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
