
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ExamCase {
  id: string;
  case_number: string;
  title: string;
  clinical_history: string | null;
  dicom_path: string | null;
}

export const useExamCases = () => {
  const [cases, setCases] = useState<(ExamCase | null)[]>(Array(25).fill(null));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch all published cases
        const { data: publishedCases, error: fetchError } = await supabase
          .from('cases')
          .select('id, case_number, title, clinical_history, dicom_path')
          .eq('published', true)
          .order('created_at', { ascending: true });

        if (fetchError) {
          throw fetchError;
        }

        // Map cases to positions 1-25
        const mappedCases: (ExamCase | null)[] = Array(25).fill(null);
        
        if (publishedCases && publishedCases.length > 0) {
          for (let i = 0; i < 25; i++) {
            // Cycle through available cases if we have fewer than 25
            const caseIndex = i % publishedCases.length;
            mappedCases[i] = publishedCases[caseIndex];
          }
        }

        setCases(mappedCases);
      } catch (err) {
        console.error('Error fetching exam cases:', err);
        setError(err instanceof Error ? err.message : 'Failed to load cases');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCases();
  }, []);

  return { cases, isLoading, error };
};
