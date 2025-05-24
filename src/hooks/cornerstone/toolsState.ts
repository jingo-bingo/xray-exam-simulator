
// Track if tools have been registered globally
let toolsRegistered = false;

export const toolsState = {
  /**
   * Check if tools have been registered
   */
  areToolsRegistered: (): boolean => toolsRegistered,

  /**
   * Mark tools as registered
   */
  setToolsRegistered: (registered: boolean): void => {
    toolsRegistered = registered;
  },

  /**
   * Reset tools registration state
   */
  reset: (): void => {
    toolsRegistered = false;
    console.log("toolsState: Tools registration state reset");
  }
};
