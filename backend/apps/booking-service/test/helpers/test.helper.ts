/**
 * Test utility functions for e2e tests
 */

/**
 * Waits for a specified number of milliseconds
 * @param ms - Number of milliseconds to wait
 */
export const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
