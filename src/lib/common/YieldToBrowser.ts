/**
 * Yield to the browser so layout, paint, and GC can run.
 * Two animation frames: one after commit, one after paint.
 */
export const yieldToBrowser = (): Promise<void> =>
  new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
