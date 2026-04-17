import { api, usePaginatedQuery, useQuery, useQueryCachedData } from "@/lib/convex/client";
import { useTrackValues } from "@/lib/posthog/useTrackValues";
import { notEmpty } from "@utils/convex-allowed";

type Parameters = {
  query: string;
  category?: string | null;
  hexColor?: string | null;
  extraHexColors?: string[];
  bookmarked?: boolean;
  channel?: 'public' | 'user';
}

export const useSearchItems = ({ query, category, bookmarked, channel = 'public', hexColor, extraHexColors }: Parameters) => {
  const { data: _items, isLoading: isItemsLoading } = useQueryCachedData(api.router.items.getAll.authed, { key: "getAllItems", filter: category ?? undefined });
  const { data: searchResults } = useQuery(api.router.items.searchMany.anon, query ? { query, filter: category ?? undefined } : 'skip');

  const { results: bookmarkedItemIds, loadMore: loadMoreBookmarked, status: bookmarkedStatus } = usePaginatedQuery(api.router.collection.getBookmarks.authed, bookmarked ? { type: 'item' } : 'skip', { initialNumItems: 24 });
  const { data: _bookmarkedItems, isPending: isBookmarkedItemsLoading } = useQuery(api.router.items.getMany.anon, bookmarked ? { itemIds: bookmarkedItemIds.map((b) => b.itemId).filter(notEmpty) } : 'skip');

  const extraColors = extraHexColors && extraHexColors.length > 0 ? extraHexColors : undefined;
  const { results: colorResults, isLoading: isLoadingColorResults, status: colorStatus, loadMore: loadMoreColor } = usePaginatedQuery(api.router.items.searchByColor.anon, hexColor ? { hexColor, extraHexColors: extraColors, category: category ?? undefined } : 'skip', { initialNumItems: 24 });

  const hasQuery = query.length > 0;
  const isLoading = ((hasQuery && !searchResults) || isItemsLoading)
    || (!!bookmarked && isBookmarkedItemsLoading) || (!!hexColor && isLoadingColorResults);

  const _results = hexColor ? colorResults : bookmarked ? _bookmarkedItems :
    (hasQuery ? searchResults : _items) as typeof _items;

  const results = _results || [];

  useTrackValues('item_search_query_submitted', {
    query,
    category,
    channel,
    enabled: hasQuery && !isLoading
  });

  const isEmpty = results.length === 0 && !isLoading;
  const isFiltering = !!category || hasQuery || !!hexColor || !!bookmarked;
  const canLoadMore = (!!hexColor && colorStatus === 'CanLoadMore') || (!!bookmarked && bookmarkedStatus === 'CanLoadMore');

  const loadMore = () => {
    loadMoreColor(8);
    loadMoreBookmarked(8);
  }

  return { results, isLoading, isEmpty, isFiltering, canLoadMore, loadMore };
}