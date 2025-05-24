
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ExamCase {
  id: string;
  case_number: string;
  title: string;
  clinical_history: string | null;
  dicom_path: string | null;
}

interface UseExamCasesResult {
  cases: ExamCase[];
  isLoading: boolean;
  error: string | null;
}

export function useExamCases(): UseExamCasesResult {
  const [cases, setCases] = useState<ExamCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExamCases = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('cases')
          .select('id, case_number, title, clinical_history, dicom_path')
          .eq('published', true)
          .order('case_number');

        if (fetchError) {
          throw fetchError;
        }

        setCases(data || []);
      } catch (err) {
        console.error('Error fetching exam cases:', err);
        setError(err instanceof Error ? err.message : 'Failed to load exam cases');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExamCases();
  }, []);

  return { cases, isLoading, error };
}
