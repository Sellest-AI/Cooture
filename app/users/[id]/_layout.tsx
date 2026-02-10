import { ROUTES, useRoute } from "@/hooks";
import { useAccount } from "@/lib/convex/auth";
import { api, Id, usePaginatedQueryCached, useQuery } from "@/lib/convex/client";
import { Screen } from "@/modules/profiles/page";
import { Redirect } from "expo-router";

export const unstable_settings = {
  initialRouteName: 'outfits',
};

export default function Layout() {
  const { searchParams } = useRoute<{ id: Id<'users'> }>(ROUTES.USER.PATH);

  const _generations = usePaginatedQueryCached(api.router.generations.getPaginated.anon, { userId: searchParams.id }, { initialNumItems: 4 });
  const { data: user } = useQuery(api.router.users.getAccount.anon, { userId: searchParams.id });

  const recentPosts = (_generations?.results ?? [])
    .flatMap(generation => generation.predictions)
    .sort((a, b) => b._creationTime - a._creationTime)
    .filter((a) => a.image);

  const { user: account } = useAccount();
  if (searchParams.id === account?._id)
    return <Redirect href={ROUTES.PROFILE.PATH} />

  return (
    <Screen
      user={user}
      isSelf={false}
      style={{
        paddingBottom: 20
      }}
      recentPosts={recentPosts.map((r) => ({
        _id: r._id,
        image: r.image!
      }))}
    />
  )
}