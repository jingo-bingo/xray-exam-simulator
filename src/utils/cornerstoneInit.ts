
import { dependencyValidator } from './cornerstone/dependencyValidator';
import { cornerstoneSetup } from './cornerstone/cornerstoneSetup';
import { initializationState } from './cornerstone/initializationState';

/**
 * Verify if cornerstone has been properly initialized
 */
export function isCornerstoneInitialized() {
  return initializationState.isCornerstoneInitialized();
}

/**
 * Check if cornerstone-tools has been initialized
 */
export function isCornerstoneToolsInitialized() {
  return initializationState.isCornerstoneToolsInitialized();
}

/**
 * Wait for cornerstone initialization with timeout
 */
export function waitForCornerstoneInitialization(timeoutMs = 5000): Promise<boolean> {
  return initializationState.waitForInitialization(timeoutMs);
}

/**
 * Initialize cornerstone core first, then setup tools
 * Returns true if initialization was successful or already done
 */
export function initializeCornerstone(): boolean {
  // If already initialized, return immediately
  if (initializationState.isCornerstoneInitialized()) {
    console.log("cornerstoneInit: Already initialized");
    return true;
  }
  
  // Check if we've exceeded maximum retry attempts
  if (initializationState.getInitializationAttempts() >= initializationState.getMaxAttempts()) {
    console.error("cornerstoneInit: Exceeded maximum initialization attempts");
    initializationState.dispatchFailed();
    return false;
  }
  
  const attempt = initializationState.incrementAttempts();
  console.log(`cornerstoneInit: Starting initialization (attempt ${attempt})`);
  
  try {
    // Check dependencies first
    if (!dependencyValidator.verifyDependencies()) {
      console.error("cornerstoneInit: Required libraries not available");
      scheduleRetry();
      return false;
    }
    
    // Check browser compatibility
    if (!dependencyValidator.isBrowserEnvironmentCompatible()) {
      console.error("cornerstoneInit: Browser environment not compatible");
      initializationState.dispatchFailed();
      return false;
    }
    
    // Set up cornerstone components
    cornerstoneSetup.setupImageLoaders();
    cornerstoneSetup.configureWADOLoader();
    
    if (!cornerstoneSetup.setupCornerstoneTools()) {
      scheduleRetry();
      return false;
    }
    
    // Mark as initialized
    initializationState.setCornerstoneInitialized(true);
    console.log("cornerstoneInit: Initialization successful");
    
    initializationState.dispatchInitialized();
    return true;
    
  } catch (error) {
    console.error("cornerstoneInit: Initialization failed:", error);
    
    if (initializationState.getInitializationAttempts() < initializationState.getMaxAttempts()) {
      scheduleRetry();
    } else {
      initializationState.dispatchFailed();
    }
    
    return false;
  }
}

/**
 * Schedule a retry with increasing delay
 */
function scheduleRetry() {
  const delay = initializationState.getRetryDelay() * initializationState.getInitializationAttempts();
  console.log(`cornerstoneInit: Will retry in ${delay}ms`);
  
  setTimeout(() => {
    initializeCornerstone();
  }, delay);
}

/**
 * Reset the initialization state - useful for testing or recovery
 */
export function resetCornerstoneInitialization() {
  initializationState.reset();
}
