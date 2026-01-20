import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries } from "convex-helpers/react/cache";

import { useAction as useConvexAction, useMutation as useConvexMutation } from "convex/react";

import { useCallback, useState } from 'react';

export * from './api';

export { usePaginatedQuery as usePaginatedQueryCached } from "convex-helpers/react/cache";
export { usePreloadedQuery } from "convex/react";
export type { Preloaded } from "convex/react";

export const useQueryCached = makeUseQueryWithStatus(useQueries);

export { useQuery } from "convex-helpers/react";
export { useConvex, usePaginatedQuery } from 'convex/react';

const useWithLoader = <A extends unknown[], R>(fn: (...args: A) => Promise<R>) => {
  const [isLoading, setLoading] = useState(false);
  const [isSuccess, setSuccess] = useState(false);
  const [isError, setError] = useState(false);

  const execute = useCallback(
    async (...args: A): Promise<R | undefined> => {
      try {
        setLoading(true);
        const result = await fn(...args);
        setSuccess(true);
        setError(false);
        setLoading(false);
        return result;
      } catch {
        setError(true);
        setSuccess(false);
        setLoading(false);
      }
    },
    [fn]
  );

  return { execute, isLoading, isSuccess, isError };
}

type MutationPath = Parameters<typeof useConvexMutation>[0];
type MutationFn<T extends MutationPath> = ReturnType<typeof useConvexMutation<T>>;
export const useMutation = <T extends MutationPath>(path: T) => {
  const mutate = useConvexMutation(path);
  const { execute, isLoading, isSuccess, isError } = useWithLoader(mutate);
  return { mutate: execute as MutationFn<T>, isLoading, isSuccess, isError };
}

type ActionPath = Parameters<typeof useConvexAction>[0];
type ActionFn<T extends ActionPath> = ReturnType<typeof useConvexAction<T>>;
export const useAction = <T extends ActionPath>(path: T) => {
  const action = useConvexAction(path);
  const { execute, isLoading, isSuccess, isError } = useWithLoader(action);
  return { action: execute as ActionFn<T>, isLoading, isSuccess, isError };
}