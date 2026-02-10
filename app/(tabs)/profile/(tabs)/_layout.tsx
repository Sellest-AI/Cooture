import { useAccount } from "@/lib/convex/auth";
import { api, usePaginatedQueryCached } from "@/lib/convex/client";
import { Screen } from "@/modules/profiles/page";
import { TOTAL_TABS_SPACE } from "@/modules/tabs";

export const unstable_settings = {
  initialRouteName: 'outfits',
};

export default function Layout() {
  const _generations = usePaginatedQueryCached(api.router.generations.getPaginated.authed, {}, { initialNumItems: 8 });
  const { user } = useAccount();

  const recentPosts = (_generations?.results ?? [])
    .flatMap(generation => generation.predictions)
    .filter((p) => p.status === 'ACCEPTED' && p.image)
    .sort((a, b) => b._creationTime - a._creationTime)
    .filter((a) => a.image);

  return (
    <Screen
      style={{ paddingBottom: TOTAL_TABS_SPACE }}
      user={user}
      isSelf={true}
      recentPosts={recentPosts.map((r) => ({
        _id: r._id,
        image: r.image!
      }))}
    />
  )
}