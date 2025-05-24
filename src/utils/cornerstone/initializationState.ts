
// Global initialization tracking
let cornerstoneInitialized = false;
let cornerstoneToolsInitialized = false;
let initializationAttempts = 0;

const MAX_INITIALIZATION_ATTEMPTS = 5;
const RETRY_DELAY_MS = 300;

// Global events for initialization status
const CORNERSTONE_INITIALIZED_EVENT = 'cornerstoneInitialized';
const CORNERSTONE_INIT_FAILED_EVENT = 'cornerstoneInitFailed';

export const initializationState = {
  // Getters
  isCornerstoneInitialized: (): boolean => cornerstoneInitialized,
  isCornerstoneToolsInitialized: (): boolean => cornerstoneToolsInitialized,
  getInitializationAttempts: (): number => initializationAttempts,
  getMaxAttempts: (): number => MAX_INITIALIZATION_ATTEMPTS,
  getRetryDelay: (): number => RETRY_DELAY_MS,

  // Setters
  setCornerstoneInitialized: (value: boolean): void => {
    cornerstoneInitialized = value;
  },
  
  setCornerstoneToolsInitialized: (value: boolean): void => {
    cornerstoneToolsInitialized = value;
  },
  
  incrementAttempts: (): number => {
    return ++initializationAttempts;
  },
  
  reset: (): void => {
    cornerstoneInitialized = false;
    cornerstoneToolsInitialized = false;
    initializationAttempts = 0;
    console.log("initializationState: State reset");
  },

  // Events
  dispatchInitialized: (): void => {
    document.dispatchEvent(new CustomEvent(CORNERSTONE_INITIALIZED_EVENT));
  },
  
  dispatchFailed: (): void => {
    document.dispatchEvent(new CustomEvent(CORNERSTONE_INIT_FAILED_EVENT));
  },

  // Event listeners
  waitForInitialization: (timeoutMs = 5000): Promise<boolean> => {
    return new Promise((resolve) => {
      if (cornerstoneInitialized) {
        resolve(true);
        return;
      }
      
      const timeout = setTimeout(() => {
        document.removeEventListener(CORNERSTONE_INITIALIZED_EVENT, onInitialized);
        document.removeEventListener(CORNERSTONE_INIT_FAILED_EVENT, onFailed);
        resolve(false);
      }, timeoutMs);
      
      const onInitialized = () => {
        clearTimeout(timeout);
        document.removeEventListener(CORNERSTONE_INITIALIZED_EVENT, onInitialized);
        document.removeEventListener(CORNERSTONE_INIT_FAILED_EVENT, onFailed);
        resolve(true);
      };
      
      const onFailed = () => {
        clearTimeout(timeout);
        document.removeEventListener(CORNERSTONE_INITIALIZED_EVENT, onInitialized);
        document.removeEventListener(CORNERSTONE_INIT_FAILED_EVENT, onFailed);
        resolve(false);
      };
      
      document.addEventListener(CORNERSTONE_INITIALIZED_EVENT, onInitialized);
      document.addEventListener(CORNERSTONE_INIT_FAILED_EVENT, onFailed);
    });
  }
};
