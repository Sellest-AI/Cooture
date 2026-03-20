import { useAccount } from "@/lib/convex/auth";
import { api, usePaginatedQueryCached, useQueryCached } from "@/lib/convex/client";
import { Screen } from "@/modules/profiles/page";
import { TOTAL_TABS_SPACE } from "@/modules/tabs";
import { notEmpty } from "@utils/convex-allowed";
import { Platform } from "react-native";

export const unstable_settings = {
  initialRouteName: 'outfits',
};

export default function Layout() {
  const { user } = useAccount();
  const _generations = usePaginatedQueryCached(api.router.generations.getPaginated.anon, user ? { userId: user._id } : 'skip', { initialNumItems: 8 });

  const recentPosts = (_generations?.results ?? [])
    .flatMap(generation => generation.predictions)
    .sort((a, b) => b._creationTime - a._creationTime)

  const imageIds = recentPosts.map((p) => p.imageId).filter(notEmpty);
  const { data: images } = useQueryCached(api.router.storage.images.getMany.anon, imageIds ? { imageIds } : 'skip');

  return (
    <Screen
      style={{ paddingBottom: TOTAL_TABS_SPACE, paddingTop: Platform.OS !== 'ios' ? 8 : 0 }}
      user={user}
      isSelf={true}
      recentPosts={
        recentPosts.map((r) => ({
          image: images?.find((i) => i._id === r.imageId),
          _id: r._id,
        })).filter((p) => p.image).map((p) => ({ ...p, image: p.image! }))
      }
    />
  )
}