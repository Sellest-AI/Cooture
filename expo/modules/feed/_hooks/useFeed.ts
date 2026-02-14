import { api, usePaginatedQuery } from "@/lib/convex/client";
import { useMemo, useState } from "react";

// Get age
const getAge = () => {
  const ONE_MINUTE = 60 * 1000;
  const REFRESH_INTERVAL = 11 * ONE_MINUTE; // 10 minutes

  // Half random offset from 0-10 based on "now"
  const now = Date.now();
  // Only update the age every 10 minutes to avoid too many updates
  const reducedAge = Math.floor(now / REFRESH_INTERVAL) * REFRESH_INTERVAL;

  // Add the offset to the age to spread out the updates at different times
  return reducedAge;
}

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
  const [age, setAge] = useState(getAge());

  const { results: _feed, loadMore, isLoading, status } = usePaginatedQuery(api.router.feed.getPaginated.anon, { maxAge: age }, { initialNumItems: params?.initialNumItems ?? 8 });

  const feed = useMemo(() => [..._feed].sort((a, b) => {
    if (seed === null) return 0;
    return hash(a._id, seed) - hash(b._id, seed);
  }), [_feed, seed]);

  const canLoadMore = status !== 'Exhausted' && status !== 'LoadingFirstPage';

  const updateSeed = () => {
    setSeed((s) => (s ?? 0) + 1);
    setAge(getAge());
  }

  return {
    feed,
    canLoadMore,
    isLoading,
    loadMore,
    updateSeed
  };
}