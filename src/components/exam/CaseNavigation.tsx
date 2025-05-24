
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    <div className="w-24 bg-white flex flex-col border-r-4 border-gray-300">
      {/* Overview header with exact same styling as other headers */}
      <div className="p-3 bg-gray-800 text-white text-center text-sm font-medium uppercase tracking-wide">
        OVERVIEW
      </div>
      
      {/* Scrollable case numbers section */}
      <div className="flex-1 bg-white">
        <ScrollArea className="h-full">
          <div className="p-2">
            <div className="flex flex-col gap-1">
              {Array.from({ length: totalCases }, (_, i) => i + 1).map((caseNumber) => {
                const isCompleted = completedCases.has(caseNumber);
                const isCurrent = caseNumber === currentCase;
                
                return (
                  <button
                    key={caseNumber}
                    onClick={() => onCaseSelect(caseNumber)}
                    className={`
                      w-full h-8 text-xs font-medium text-center
                      ${isCurrent 
                        ? 'bg-blue-500 text-white' 
                        : isCompleted
                        ? 'bg-green-800 text-white'
                        : 'text-gray-700 hover:bg-gray-200'
                      }
                      transition-colors duration-150
                    `}
                  >
                    {caseNumber}
                  </button>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
