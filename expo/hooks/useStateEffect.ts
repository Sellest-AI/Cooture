import { useEffect, useMemo, useState } from "react";

export const useStateEffect = <T>(
  initialState: T,
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(initialState);

  // For objects/arrays we compare by stable JSON to avoid reacting to
  // shallow reference changes. This keeps the hook usable for typical
  // serializable data shapes (arrays of ids, plain objects).
  const initialDep = useMemo(() => {
    if (initialState !== null && typeof initialState === 'object') {
      try {
        return JSON.stringify(initialState);
      } catch {
        return String(initialState);
      }
    }
    return initialState as any;
  }, [initialState]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialStateMemo = useMemo(() => initialState, [initialDep]);

  // Do NOT return the setter from useEffect (that was causing immediate
  // invocation and render loops). Just set state when initialState changes.
  useEffect(() => { setState(initialStateMemo); }, [initialStateMemo]);

  return [state, setState];
};