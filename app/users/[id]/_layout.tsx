import { ROUTES, useRoute } from "@/hooks";
import { useAccount } from "@/lib/convex/auth";
import { api, Id, usePaginatedQueryCached, useQuery, useQueryCached } from "@/lib/convex/client";
import { Screen } from "@/modules/profiles/page";
import { notEmpty } from "@utils/convex-allowed";
import { Redirect } from "expo-router";

export const unstable_settings = {
  initialRouteName: 'outfits',
};

export default function Layout() {
  const { id } = useRoute.Params<{ id: Id<'users'> }>();

  const _generations = usePaginatedQueryCached(api.router.generations.getPaginated.anon, { userId: id }, { initialNumItems: 4 });
  const { data: user } = useQuery(api.router.users.getAccount.anon, { userId: id });

  const recentPosts = (_generations?.results ?? [])
    .flatMap(generation => generation.predictions)
    .sort((a, b) => b._creationTime - a._creationTime)
    .filter((a) => a.imageId);

  const imageIds = recentPosts.map((p) => p.imageId).filter(notEmpty);
  const { data: images } = useQueryCached(api.router.storage.images.getMany.anon, imageIds ? { imageIds } : 'skip');

  const { user: account } = useAccount();
  if (id === account?._id)
    return <Redirect href={ROUTES.PROFILE.PATH} />

  return (
    <Screen
      user={user}
      isSelf={false}
      style={{
        paddingBottom: 20
      }}
      recentPosts={recentPosts.map((r) => ({
        image: images?.find((i) => i._id === r.imageId),
        _id: r._id,
      })).filter((p) => p.image).map((p) => ({ ...p, image: p.image! }))}
    />
  )
}