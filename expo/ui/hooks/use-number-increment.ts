import { useEffect, useMemo, useRef, useState } from "react";

type Options = {
  initialValue?: number;
  initialDelay?: number;
  duration?: number;
}

export const useNumberIncrement = (targetValue: number | null | undefined, options?: Options) => {
  const [displayedValue, setDisplayedValue] = useState<number>(options?.initialValue ?? 0);

  const startValueRef = useRef<number>(options?.initialValue ?? 0);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const duration = useMemo(() => options?.duration ?? 800, [options?.duration]);
  const initialDelay = useMemo(() => options?.initialDelay ?? 0, [options?.initialDelay]);

  useEffect(() => {
    // If target is invalid, do nothing
    if (targetValue === null || targetValue === undefined || Number.isNaN(targetValue)) {
      return;
    }

    // Cleanup previous animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const animate = (timestamp: number) => {
      // Initialize start time on first frame
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutQuint: 1 - (1 - x)^5
      const easedProgress = 1 - Math.pow(1 - progress, 5);

      const start = startValueRef.current;
      const nextValue = Math.round(start + (targetValue - start) * easedProgress);

      setDisplayedValue(nextValue);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Ensure accurate final value
        setDisplayedValue(targetValue);
        startValueRef.current = targetValue;
      }
    };

    const startAnimation = () => {
      // Capture the current displayed value as the new starting point
      startValueRef.current = displayedRef.current;
      startTimeRef.current = null; // Reset animation timer

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // If there's an initial delay, use setTimeout
    if (initialDelay > 0) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(startAnimation, initialDelay);
    } else {
      startAnimation();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [targetValue, duration, initialDelay]); // Removed displayedValue from dependencies

  // Keep displayedRef in sync with state for the effect to read without adding dependency
  const displayedRef = useRef(displayedValue);
  useEffect(() => { displayedRef.current = displayedValue; }, [displayedValue]);

  return {
    value: targetValue,
    displayedValue,
  };
}