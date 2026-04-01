import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries } from "convex-helpers/react/cache";

import { useAction as useConvexAction, useMutation as useConvexMutation } from "convex/react";

import { atom, useAtom } from "jotai";
import { useCallback, useEffect, useMemo, useState } from 'react';

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
      } catch (e) {
        setError(true);
        setSuccess(false);
        setLoading(false);
        throw (e);
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

const cachedAtom = atom({} as Record<string, any>);

type Params<T extends ActionPath> = T['_args'] & { key: string };
export const useQueryCachedData = <T extends ActionPath>(path: T, params: Params<T>) => {
  const { key, ...actionParams } = params;
  const action = useConvexAction(path);
  const { execute, isLoading, isSuccess, isError } = useWithLoader(action);

  const [cached, setCached] = useAtom(cachedAtom);

  // Generate a cache key based on the path and params
  // The json will be sorted by key asc to ensure consistent keys for same params with different order
  const cacheKey = useMemo(() => `${key}:${JSON.stringify(actionParams, Object.keys(actionParams || {}).sort())}`, [key, actionParams]);
  const [data, setData] = useState<Awaited<ReturnType<ActionFn<T>>> | undefined>(cached[cacheKey]);

  const reload = useCallback(async () => {
    const result = await execute(actionParams as T['_args']);
    setData(result);
    setCached((prev) => ({ ...prev, [cacheKey]: result }));
  }, [execute, actionParams, cacheKey, setCached]);

  useEffect(() => {
    if (!!data) return;
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return { data, isLoading, isSuccess, isError, reload };
}
