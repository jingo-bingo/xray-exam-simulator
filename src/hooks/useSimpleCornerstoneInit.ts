
import { useState, useEffect, useRef } from 'react';
import { initializeCornerstone, isCornerstoneInitialized, waitForCornerstoneInitialization } from '@/utils/cornerstoneInit';

interface UseCornerstoneInitResult {
  isInitialized: boolean;
  error: string | null;
  initAttempt: number;
}

export function useSimpleCornerstoneInit(
  instanceId: string = "default"
): UseCornerstoneInitResult {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);
  const initAttemptRef = useRef(0);
  const MAX_INIT_ATTEMPTS = 5;

  useEffect(() => {
    console.log(`useSimpleCornerstoneInit[${instanceId}]: Setting up initialization`);
    isMounted.current = true;
    
    const attemptInitialization = async () => {
      // Check if we've exceeded maximum attempts
      if (initAttemptRef.current >= MAX_INIT_ATTEMPTS) {
        setError("Failed to initialize DICOM viewer after multiple attempts");
        return false;
      }
      
      initAttemptRef.current++;
      console.log(`useSimpleCornerstoneInit[${instanceId}]: Attempting cornerstone initialization (attempt ${initAttemptRef.current})`);
      
      try {
        // Check if already initialized
        if (isCornerstoneInitialized()) {
          console.log(`useSimpleCornerstoneInit[${instanceId}]: Cornerstone already initialized`);
          if (isMounted.current) {
            setIsInitialized(true);
            setError(null);
          }
          return true;
        }
        
        // Initialize cornerstone libraries
        const initialized = initializeCornerstone();
        
        if (!initialized) {
          console.error(`useSimpleCornerstoneInit[${instanceId}]: Failed to initialize cornerstone directly`);
          
          // Try waiting for initialization to complete
          const waitResult = await waitForCornerstoneInitialization(3000);
          
          if (!waitResult) {
            console.error(`useSimpleCornerstoneInit[${instanceId}]: Initialization timed out`);
            
            // If we haven't reached the max attempts, schedule another attempt
            if (initAttemptRef.current < MAX_INIT_ATTEMPTS && isMounted.current) {
              setTimeout(() => {
                attemptInitialization();
              }, 300 * initAttemptRef.current);
            } else if (isMounted.current) {
              setError("Failed to initialize DICOM viewer libraries");
            }
            return false;
          }
        }
        
        if (isMounted.current) {
          setIsInitialized(true);
          setError(null);
        }
        return true;
      } catch (error) {
        console.error(`useSimpleCornerstoneInit[${instanceId}]: Error during initialization:`, error);
        
        if (!isMounted.current) return false;
        
        if (initAttemptRef.current < MAX_INIT_ATTEMPTS) {
          // Schedule another attempt
          setTimeout(() => {
            attemptInitialization();
          }, 300 * initAttemptRef.current);
          return false;
        } else {
          setError("Failed to initialize DICOM viewer");
          return false;
        }
      }
    };
    
    // Start initialization process
    attemptInitialization();
    
    return () => {
      isMounted.current = false;
    };
  }, [instanceId]);

  return {
    isInitialized,
    error,
    initAttempt: initAttemptRef.current
  };
}
