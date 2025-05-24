
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
}

export const ExamFinishModal: React.FC<ExamFinishModalProps> = ({
  isOpen,
  onClose,
  onSubmitExam,
  unansweredCount
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold">
            Ready to finish?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-gray-600 mt-2">
            <div className="space-y-2">
              <p>rad2b/assess</p>
              {unansweredCount > 0 && (
                <p className="text-orange-600">
                  You have {unansweredCount} unanswered question{unansweredCount !== 1 ? 's' : ''}.
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-3">
          <AlertDialogCancel onClick={onClose} className="bg-gray-100 hover:bg-gray-200">
            Continue Exam
          </AlertDialogCancel>
          <AlertDialogAction onClick={onSubmitExam} className="bg-blue-600 hover:bg-blue-700">
            Submit Exam
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
