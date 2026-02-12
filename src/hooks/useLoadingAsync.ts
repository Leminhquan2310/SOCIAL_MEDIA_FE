import { useLoading } from "../contexts/LoadingContext";
import { useCallback } from "react";

/**
 * Hook to handle async operations with loading state
 * Automatically shows/hides loading overlay
 *
 * @example
 * const { executeAsync } = useLoadingAsync();
 * const handleSubmit = async () => {
 *   await executeAsync(register(data), "Creating account...");
 * };
 */
export const useLoadingAsync = () => {
  const { showLoading, hideLoading } = useLoading();

  const executeAsync = useCallback(
    async <T>(promise: Promise<T>, message: string = "Loading..."): Promise<T> => {
      try {
        showLoading(message);
        const result = await promise;
        hideLoading();
        return result;
      } catch (error) {
        hideLoading();
        throw error;
      }
    },
    [showLoading, hideLoading],
  );

  return { executeAsync };
};
