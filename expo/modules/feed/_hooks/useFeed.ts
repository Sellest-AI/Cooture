import { useAccount } from "@/lib/convex/auth";
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

  const { user } = useAccount();
  const { results: _userFeed } = usePaginatedQuery(api.router.generations.getPaginated.anon, user ? { userId: user._id } : 'skip', { initialNumItems: 4 });
  const { results: _feed, loadMore, isLoading, status } = usePaginatedQuery(api.router.feed.getPaginated.anon, { maxAge: age }, { initialNumItems: params?.initialNumItems ?? 8 });

  const userFeed = useMemo(() => (_userFeed ?? []).map((u) => ({
    _id: u._id,
    _creationTime: u._creationTime,
    type: 'generation' as const
  })), [_userFeed]);

  const feed = useMemo(() => {
    // Only shuffle the first 12 items
    const first12 = _feed.slice(0, params.initialNumItems);
    const rest = _feed.slice(params.initialNumItems);

    const shuffledFirst12 = [...first12].sort((a, b) => {
      if (seed === null) return 0;
      return hash(a._id, seed) - hash(b._id, seed);
    });

    const sortedFeed = [...shuffledFirst12, ...rest];

    // If no user or no userFeed, just return the sorted feed
    if (!userFeed || userFeed.length === 0) {
      return sortedFeed;
    }

    // Filter user's posts that are more recent than age
    const recentUserPosts = userFeed
      .filter(post => post._creationTime >= age)
      .sort((a, b) => b._creationTime - a._creationTime); // Most recent first

    // If no recent posts, just return the sorted feed
    if (recentUserPosts.length === 0) {
      return sortedFeed;
    }

    // Remove any duplicates from sortedFeed (in case recent posts are already included)
    const feedWithoutDuplicates = sortedFeed.filter(
      post => !recentUserPosts.some(recentPost => recentPost._id === post._id)
    );

    // Add recent user posts at the top
    return [...recentUserPosts, ...feedWithoutDuplicates];
  }, [_feed, params, userFeed, seed, age]);

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