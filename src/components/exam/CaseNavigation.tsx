
import React from 'react';
import { Flag } from 'lucide-react';

interface ExamCase {
  id: string;
  case_number: string;
  title: string;
  clinical_history: string | null;
  dicom_path: string | null;
}

interface CaseNavigationProps {
  currentCaseIndex: number;
  cases: ExamCase[];
  completedCases: Set<number>;
  flaggedCases: Set<number>;
  onCaseSelect: (caseIndex: number) => void;
  isLoading: boolean;
}

export const CaseNavigation: React.FC<CaseNavigationProps> = ({
  currentCaseIndex,
  cases,
  completedCases,
  flaggedCases,
  onCaseSelect,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="w-24 bg-white flex flex-col border-r-4 border-gray-300">
        <div className="p-3 bg-gray-800 text-white text-left text-sm font-medium uppercase tracking-wide">
          OVERVIEW
        </div>
        <div className="flex-1 bg-white p-2">
          <div className="animate-pulse space-y-1">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
              {cases.map((examCase, index) => {
                const isCompleted = completedCases.has(index);
                const isCurrent = index === currentCaseIndex;
                const isFlagged = flaggedCases.has(index);
                
                return (
                  <button
                    key={examCase.id}
                    onClick={() => onCaseSelect(index)}
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
                    title={examCase.title}
                  >
                    <span>{examCase.case_number}</span>
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
