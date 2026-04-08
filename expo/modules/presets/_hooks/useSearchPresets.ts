import { api, Api, Id, useQuery, useQueryCached } from "@/lib/convex/client";
import { useTrackValues } from "@/lib/posthog/useTrackValues";
import { notEmpty, shuffleWithSeed } from "@utils/convex-allowed";
import { useState } from "react";

type Args = {
  category?: Api['router']['presets']['getByCategory']['anon']['_args']['category'] | null;
  query?: string;
  userId?: Id<'users'>;
}

export const useSearchPresets = ({ category, userId, query = '' }: Args) => {
  const [seed] = useState(new Date().getHours());
  const { data: _presetsByCategory, isPending: isCategoryLoading } = useQuery(api.router.presets.getByCategory.anon, category ? { category } : 'skip');
  const { data: _presetsByCategoryUser, isPending: isUserCategoryLoading } = useQuery(api.router.presets.getByCategory.authed, category ? { category } : 'skip');

  const { data: _searchedPresets, isPending: isSearchLoading } = useQuery(api.router.presets.searchMany.anon, query.length > 0 ? { query } : 'skip');
  const { data: _searchPresetsUser, isPending: isUserSearchLoading } = useQuery(api.router.presets.searchMany.authed, query.length > 0 ? { query } : 'skip');

  const { data: userPresets, isPending: isUserPresetsLoading } = useQueryCached(api.router.presets.getByUser.anon, userId ? { userId } : 'skip');
  const { data: manyPresets, isPending: isManyPresetsLoading } = useQueryCached(api.router.presets.getMany.anon, { seed, limit: 64 });

  const isLoading = (category && isCategoryLoading) || (category && userId && isUserCategoryLoading)
    || (query.length > 0 && isSearchLoading) || (query.length > 0 && userId && isUserSearchLoading)
    || (userId && isUserPresetsLoading) || isManyPresetsLoading;

  const categoryPresets = [...(_presetsByCategory ?? []), ...(_presetsByCategoryUser ?? [])]
    .filter((preset, i, self) => i === self.findIndex((p) => p._id === preset._id));

  const searchedPresets = [...(_searchedPresets ?? []), ...(_searchPresetsUser ?? [])]
    .filter((preset, i, self) => i === self.findIndex((p) => p._id === preset._id));

  // If the user has created a preset in the last 24h, we want to showcase it at the beginning of the list
  const showcasedPreset = (userPresets?.[0]?._creationTime ?? 0) > (Date.now() - 24 * 60 * 60 * 1000);

  const mergedUserPresets = [
    showcasedPreset ? userPresets?.[0] : undefined,
    ...shuffleWithSeed([...userPresets ?? [], ...manyPresets ?? []], seed)
  ].filter(notEmpty)
    .filter((preset, i, self) => i === self.findIndex((p) => p._id === preset._id));

  const mergedOrSearchPresets = (searchedPresets ?? []).length > 0 ? (searchedPresets ?? []) : (mergedUserPresets ?? []);

  useTrackValues('preset_search_query_submitted', {
    query,
    category,
    enabled: query.length > 0 && !isLoading
  });

  const finalPresets = (category ? (categoryPresets) : mergedOrSearchPresets);

  return {
    isLoading,
    presets: finalPresets,
  }
}