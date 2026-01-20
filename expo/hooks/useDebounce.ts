import { useState, useEffect, useCallback, useRef } from "react";

const useDebounceInternal = <T>(value: T, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const debouncedRef = useRef<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (debouncedRef.current === value) return;
      // if it's an object, conver to string and compare
      if (typeof value === 'object' && typeof debouncedRef.current === 'object') {
        if (JSON.stringify(debouncedRef.current) === JSON.stringify(value)) return;
      }

      setDebouncedValue(value);
      debouncedRef.current = value;
    }, delay);

    // Cleanup timeout if value or delay changes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return [debouncedValue, setDebouncedValue] as const;
}

export const useDebounce = <T>(value: T, delay: number) => {
  const [debouncedValue] = useDebounceInternal(value, delay);
  return debouncedValue;
};

const useDebounceExtended = <T>(value: T, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useDebounceInternal(value, delay);
  const forceDebounceUpdate = useCallback(() => { setDebouncedValue(value); }, [setDebouncedValue, value])
  return { value: debouncedValue, forceDebounceUpdate };
};

useDebounce.Extended = useDebounceExtended;