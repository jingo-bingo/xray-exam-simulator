
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Question {
  id: string;
  question_text: string;
  type: string;
  correct_answer: string | null;
  explanation: string | null;
  display_order: number;
}

export interface AnswerSubmission {
  questionId: string;
  responseText: string;
  isCorrect?: boolean;
  feedback?: string;
}

export const useQuestions = (caseId: string, userId: string) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, AnswerSubmission>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch questions for the case
  const { data: questions, isLoading, error } = useQuery({
    queryKey: ["caseQuestions", caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("case_id", caseId)
        .order("display_order");

      if (error) {
        throw new Error(error.message);
      }

      return data as Question[];
    },
    enabled: !!caseId,
  });

  // Check for existing answers
  useEffect(() => {
    const fetchExistingAnswers = async () => {
      if (!caseId || !userId || !questions) return;
      
      const { data, error } = await supabase
        .from("answers")
        .select("*")
        .eq("case_id", caseId)
        .eq("user_id", userId);
        
      if (error) {
        console.error("Error fetching existing answers:", error);
        return;
      }
      
      if (data && data.length > 0) {
        const answerMap: Record<string, AnswerSubmission> = {};
        data.forEach(answer => {
          answerMap[answer.question_id] = {
            questionId: answer.question_id,
            responseText: answer.response_text,
            isCorrect: answer.is_correct || undefined,
            feedback: answer.feedback || undefined
          };
        });
        setAnsweredQuestions(answerMap);
      }
    };
    
    fetchExistingAnswers();
  }, [caseId, userId, questions]);

  const handleAnswerSubmitted = (submission: AnswerSubmission) => {
    setAnsweredQuestions(prev => ({
      ...prev,
      [submission.questionId]: submission
    }));
    
    // Automatically go to next question if available
    if (questions && currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 1500);
    }
  };

  const handleNextQuestion = () => {
    if (questions && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const checkIfAllAnswered = () => {
    if (!questions) return false;
    
    const allQuestionsAnswered = questions.every(q => !!answeredQuestions[q.id]);
    return allQuestionsAnswered;
  };

  return {
    questions,
    isLoading,
    error,
    currentQuestionIndex,
    answeredQuestions,
    isSubmitting,
    setIsSubmitting,
    handleAnswerSubmitted,
    handleNextQuestion,
    handlePrevQuestion,
    checkIfAllAnswered
  };
};
