import { ROUTES, useRouter } from "@/hooks";
import { api, Id } from "@/lib/convex/api";
import { useMutation, useQuery, useQueryCachedData } from "@/lib/convex/client";
import { Post } from "@ui/cards";
import { notEmpty } from "@utils/convex-allowed";
import { env } from "env";
import { Share, ViewStyle } from "react-native";

export const OutfitPost = ({ id, style }: { id: Id<'outfits'>, style?: ViewStyle }) => {
  const { push } = useRouter('/feed');
  const { data: outfit } = useQuery(api.router.outfits.getOne.anon, { outfitId: id });
  const { data: user } = useQuery(api.router.users.getAccount.anon, outfit ? { userId: outfit.userId } : 'skip');
  const { data: isBookmarked } = useQuery(api.router.collection.getBookmarked.authed, { outfitId: id });
  const { mutate: toggleBookmark } = useMutation(api.router.collection.toggleBookmark.authed);

  const { data: liked } = useQuery(api.router.likes.getLiked.authed, { outfitId: id });
  const { data: likes } = useQueryCachedData(api.router.likes.getLikes.anon, { outfitId: id, key: "likes" });
  const { mutate: toggleLike } = useMutation(api.router.likes.toggleLike.authed);

  if (!outfit) return <Post.Skeleton style={{ ...style, paddingHorizontal: 12 }} />;

  const cover = {
    _id: outfit._id,
    url: outfit.cover?.sizes.large.url ?? outfit.items[0].image.sizes.large.url,
    contentFit: 'contain' as const,
    backgroundColor: outfit.backgroundColor,
  }

  return <Post
    style={style}
    paddingHorizontal={12}
    postedAt={outfit._creationTime ? new Date(outfit._creationTime) : undefined}
    image={cover}
    isBookmarked={isBookmarked}
    onToggleBookmark={() => toggleBookmark({ outfitId: id })}
    onToggleLike={(v) => toggleLike({ outfitId: id, value: v })}
    likedAccounts={likes?.latestLikers.map(l => l.image).filter(notEmpty)}
    isLiked={liked}
    onShare={async (id) => {
      Share.share({
        title: env.PUBLIC_APP_URL + ROUTES.OUTFIT.ID(id),
        url: env.PUBLIC_APP_URL + ROUTES.OUTFIT.ID(id),
        message: env.PUBLIC_APP_URL + ROUTES.OUTFIT.ID(id),
      })
    }}
    onLongPress={() => push(ROUTES.OUTFIT.PATH, { pathParams: { id: outfit._id } })}
    users={user ? [{
      name: user.name ?? 'Anonymous',
      username: user.username ?? 'anon',
      imageUrl: user.image,
      onPress: () => push(ROUTES.USER.PATH, {
        pathParams: { id: user!._id }
      })
    }] : undefined}
    outfit={{
      itemUrls: outfit.items.map((i) => i.image.sizes.thumbnail.url),
      onPress: () => push(ROUTES.PHOTOSHOOT.NEW, {
        params: { outfitId: outfit._id }
      })
    }}
  // user={outfit.}
  />;
}