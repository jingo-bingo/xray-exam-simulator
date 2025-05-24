
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ExamFinishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitExam: () => void;
  unansweredCount: number;
  isTimeExpired?: boolean;
}

export const ExamFinishModal: React.FC<ExamFinishModalProps> = ({
  isOpen,
  onClose,
  onSubmitExam,
  unansweredCount,
  isTimeExpired = false
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md p-0 bg-white border-4 border-black">
        {/* Header */}
        <AlertDialogHeader className="bg-gray-800 text-white p-4 m-0">
          <AlertDialogTitle className="text-lg font-semibold text-left">
            <span className="text-white">rad2b/</span>
            <span className="text-lime-400">assess</span>
          </AlertDialogTitle>
        </AlertDialogHeader>
        
        {/* Content */}
        <div className="p-4 bg-gray-200">
          <AlertDialogDescription className="text-sm mb-4">
            {/* Blue information box */}
            <div className="bg-blue-100 border-2 border-blue-800 rounded p-3 mb-3">
              <div className="space-y-2">
                <p className="text-blue-800 font-medium">
                  All of your answers have been submitted to the server.
                </p>
                {unansweredCount > 0 && (
                  <p className="text-blue-800">
                    You have {unansweredCount} unanswered question{unansweredCount !== 1 ? 's' : ''}.
                  </p>
                )}
              </div>
            </div>
            
            {/* Instruction text in grey area */}
            <p className="text-gray-700 text-sm">
              Click "Submit exam" before closing the tab or window
            </p>
          </AlertDialogDescription>
        </div>
        
        {/* Footer */}
        <AlertDialogFooter className="flex justify-start gap-3 p-4 pt-0 bg-gray-200 m-0">
          <AlertDialogAction 
            onClick={onSubmitExam} 
            className="bg-red-800 hover:bg-red-900 text-white border-0"
          >
            Submit exam
          </AlertDialogAction>
          {!isTimeExpired && (
            <AlertDialogCancel 
              onClick={onClose} 
              className="bg-blue-400 hover:bg-blue-500 text-white border-0"
            >
              Continue exam
            </AlertDialogCancel>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
