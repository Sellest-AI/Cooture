import { useEffect, useRef } from 'react';

type UseResolveOnChangeOptions<T> = {
  /**
   * Polling interval in milliseconds
   * @default 100
   */
  interval?: number;
  /**
   * Optional callback that determines if the value should resolve the promise
   * By default, it will resolve when the value is truthy
   */
  shouldResolve?: (value: T | undefined | null) => boolean;
};

/**
 * Hook that returns a function which returns a promise that resolves when a value changes
 * from undefined/false to defined/true
 * 
 * @param value - The value to watch for changes
 * @param options - Configuration options
 * @returns A function that returns a promise resolving to the value when it becomes truthy
 */
export function useResolveOnChange<T>(
  value: T | undefined | null,
  hookOptions?: UseResolveOnChangeOptions<T>
) {
  const forceCancel = useRef(false);
  const valueRef = useRef<T | null | undefined>(value);
  const loopCountRef = useRef(0);

  // Update the ref when the value changes
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Cleanup function on unmount
  useEffect(() => {
    return () => {
      forceCancel.current = true;
    };
  }, []);

  const shouldResolve = hookOptions?.shouldResolve ?? ((val) => Boolean(val));
  type PromiseResult<T> = {
    value: NonNullable<T>;
    hasChanged: boolean;
  }
  /**
   * Options for the waitForValue function
   */
  type WaitForValueOptions = {
    /**
     * Called when the wait process starts (after the first check)
     */
    onWaitStart?: () => void;
    /**
     * Called when the promise resolves successfully
     * @param result The result of the resolved promise
     */
    onSuccess?: (result: PromiseResult<T>) => void;
    /**
     * Called when the promise is rejected
     * @param error The error that caused the rejection
     */
    onFail?: (error: Error) => void;
  }

  /** 
   * Function that returns a promise that resolves when the value changes
   * from undefined/false to defined/true
   * @param options Callback options for the waiting process
   * @returns A promise resolving to the value when it becomes truthy
   * @throws Error if the operation was cancelled
   */
  const waitForValue = async (options?: WaitForValueOptions): Promise<PromiseResult<T>> => {
    let interval: NodeJS.Timeout | null = null;
    loopCountRef.current = 0;

    // Reset cancel flag before starting
    forceCancel.current = false;

    return new Promise((resolve, reject) => {
      const check = () => {
        // Always read the current value, don't rely on closure
        const currentValue = valueRef.current;
        const completed = shouldResolve(currentValue) || forceCancel.current;

        if (completed) {
          if (interval) {
            clearInterval(interval);
            interval = null;
          }
        }

        if (shouldResolve(currentValue)) {
          // We know currentValue is truthy here because shouldResolve returned true
          const result = {
            value: currentValue as NonNullable<T>,
            hasChanged: loopCountRef.current > 0
          };

          // Call onSuccess callback if provided
          if (options?.onSuccess) {
            options.onSuccess(result);
          }

          return resolve(result);
        }

        if (forceCancel.current) {
          const error = new Error('Operation was cancelled');

          // Call onFail callback if provided
          if (options?.onFail) {
            options.onFail(error);
          }

          return reject(error);
        }

        // If this is the first loop and we're starting to wait, call onWaitStart
        if (loopCountRef.current === 0 && options?.onWaitStart) {
          options.onWaitStart();
        }

        loopCountRef.current++;        // Use setInterval for polling if not already set

        if (!interval && !completed) {
          const intervalTime = hookOptions?.interval ?? 100;
          interval = setInterval(check, intervalTime);
        }
      };

      // Initial check
      check();
    });
  };

  const cancel = () => {
    forceCancel.current = true;
  };

  return { waitForValue, cancel };
}