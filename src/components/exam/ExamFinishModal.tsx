
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
      <AlertDialogContent className="max-w-md p-0 bg-white">
        {/* Header */}
        <AlertDialogHeader className="bg-blue-900 text-white p-4 m-0">
          <AlertDialogTitle className="text-lg font-semibold text-left">
            {isTimeExpired ? 'Exam Finished' : 'Ready to finish?'}
          </AlertDialogTitle>
        </AlertDialogHeader>
        
        {/* Content */}
        <div className="p-4">
          <AlertDialogDescription className="text-sm text-gray-700 mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
              <div className="space-y-2">
                <p className="text-blue-900 font-medium">
                  rad2b/<span className="text-green-600">assess</span>
                </p>
                <p className="text-blue-800">
                  All of your answers have been submitted to the server.
                </p>
                {unansweredCount > 0 && (
                  <p className="text-orange-600">
                    You have {unansweredCount} unanswered question{unansweredCount !== 1 ? 's' : ''}.
                  </p>
                )}
              </div>
            </div>
            {isTimeExpired ? (
              <p className="text-gray-600 text-center">
                Time has expired. Please submit your exam.
              </p>
            ) : (
              <p className="text-gray-600 text-center">
                You can continue working or submit your exam now.
              </p>
            )}
          </AlertDialogDescription>
        </div>
        
        {/* Footer */}
        <AlertDialogFooter className="flex gap-3 p-4 pt-0">
          {!isTimeExpired && (
            <AlertDialogCancel 
              onClick={onClose} 
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
            >
              Continue exam
            </AlertDialogCancel>
          )}
          <AlertDialogAction 
            onClick={onSubmitExam} 
            className="bg-red-600 hover:bg-red-700 text-white border-2 border-dashed border-red-800"
          >
            Submit exam
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
