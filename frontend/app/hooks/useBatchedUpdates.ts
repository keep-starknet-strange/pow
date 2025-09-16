import { useCallback, useRef, useEffect } from "react";

/**
 * Hook for batching rapid state updates to improve performance
 * Useful for frequently clicked components like TxButton and useMiner
 *
 * @unused Currently not used but available for future performance optimizations
 */
export const useBatchedUpdates = () => {
  const batchRef = useRef<{
    updates: Array<() => void>;
    timeoutId: ReturnType<typeof setTimeout> | null;
  }>({
    updates: [],
    timeoutId: null,
  });

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (batchRef.current.timeoutId) {
        clearTimeout(batchRef.current.timeoutId);
        batchRef.current.timeoutId = null;
      }
      batchRef.current.updates = [];
    };
  }, []);

  const batchUpdate = useCallback((updateFn: () => void) => {
    batchRef.current.updates.push(updateFn);

    // Clear existing timeout
    if (batchRef.current.timeoutId) {
      clearTimeout(batchRef.current.timeoutId);
    }

    // Batch updates in next frame for better performance
    batchRef.current.timeoutId = setTimeout(() => {
      const updates = batchRef.current.updates.slice();
      batchRef.current.updates = [];
      batchRef.current.timeoutId = null;

      // Execute all batched updates
      requestAnimationFrame(() => {
        updates.forEach((update) => update());
      });
    }, 0);
  }, []);

  const flushUpdates = useCallback(() => {
    if (batchRef.current.timeoutId) {
      clearTimeout(batchRef.current.timeoutId);
    }

    const updates = batchRef.current.updates.slice();
    batchRef.current.updates = [];
    batchRef.current.timeoutId = null;

    updates.forEach((update) => update());
  }, []);

  return { batchUpdate, flushUpdates };
};
