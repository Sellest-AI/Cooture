import { api, useQuery, useQueryCachedData } from "@/lib/convex/client";

type Parameters = {
  query: string;
  category?: string | null;
  channel?: 'public' | 'user';
}

export const useSearchItems = ({ query, category, channel = 'public' }: Parameters) => {
  const { data: _items, isLoading: isItemsLoading } = useQueryCachedData(api.router.items.getAll.authed, { key: "getAllItems", filter: category ?? undefined });
  const { data: searchResults } = useQuery(api.router.items.searchMany.anon, query ? { query, filter: category ?? undefined } : 'skip');

  const hasQuery = query.length > 0;
  const isLoading = (hasQuery && !searchResults) || isItemsLoading;

  const _results = (hasQuery ? searchResults : _items) as typeof _items;
  const results = _results ?? [];

  const isEmpty = results && results.length === 0 && !isLoading;

  return { results, isLoading, isEmpty };
}