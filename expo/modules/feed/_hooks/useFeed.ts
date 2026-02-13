import { api, usePaginatedQuery } from "@/lib/convex/client";
import { useMemo, useState } from "react";

// Simple hash function for better randomization
const hash = (str: string, seed: number) => {
  let h = seed;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 2654435761);
  }
  return (h ^ (h >>> 16)) >>> 0;
};

type Props = {
  initialNumItems?: number;
}

export const useFeed = (params: Props = { initialNumItems: 8 }) => {
  const [seed, setSeed] = useState<number | null>(null);
  const { results: _feed, loadMore, isLoading, status } = usePaginatedQuery(api.router.feed.getPaginated.anon, {}, { initialNumItems: params?.initialNumItems ?? 8 });

  const feed = useMemo(() => [..._feed].sort((a, b) => {
    if (seed === null) return 0;
    return hash(a._id, seed) - hash(b._id, seed);
  }), [_feed, seed]);

  const canLoadMore = status !== 'Exhausted' && status !== 'LoadingFirstPage';

  return {
    feed,
    canLoadMore,
    isLoading,
    loadMore,
    setSeed
  };
}