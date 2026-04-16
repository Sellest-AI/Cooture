import { api, usePaginatedQuery, useQuery, useQueryCachedData } from "@/lib/convex/client";
import { useTrackValues } from "@/lib/posthog/useTrackValues";
import { notEmpty } from "@utils/convex-allowed";

type Parameters = {
  query: string;
  category?: string | null;
  bookmarked?: boolean;
  channel?: 'public' | 'user';
  onloadMore?: () => void;
}

export const useSearchItems = ({ query, category, bookmarked, channel = 'public', onloadMore }: Parameters) => {
  const { data: _items, isLoading: isItemsLoading } = useQueryCachedData(api.router.items.getAll.authed, { key: "getAllItems", filter: category ?? undefined });
  const { data: searchResults } = useQuery(api.router.items.searchMany.anon, query ? { query, filter: category ?? undefined } : 'skip');

  const { results: bookmarkedItemIds, loadMore } = usePaginatedQuery(api.router.collection.getBookmarks.authed, bookmarked ? { type: 'item' } : 'skip', { initialNumItems: 24 });
  const { data: _bookmarkedItems, isPending: isBookmarkedItemsLoading } = useQuery(api.router.items.getMany.anon, bookmarked ? { itemIds: bookmarkedItemIds.map((b) => b.itemId).filter(notEmpty) } : 'skip');

  const hasQuery = query.length > 0;
  const isLoading = (hasQuery && !searchResults) || isItemsLoading || (bookmarked && isBookmarkedItemsLoading);

  const _results = bookmarked ? _bookmarkedItems :
    (hasQuery ? searchResults : _items) as typeof _items;
  const results = _results || [];

  useTrackValues('item_search_query_submitted', {
    query,
    category,
    channel,
    enabled: hasQuery && !isLoading
  });

  const isEmpty = results.length === 0 && !isLoading;
  const isFiltering = !!category || hasQuery;

  const onLoadMore = () => {
    loadMore(8);
  }

  return { results, isLoading, isEmpty, isFiltering, onLoadMore };
}