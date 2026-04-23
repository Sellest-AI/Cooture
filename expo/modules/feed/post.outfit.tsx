import { ROUTES, useRouter } from "@/hooks";
import { api, Id } from "@/lib/convex/api";
import { useAccount } from "@/lib/convex/auth";
import { useMutation, useQuery, useQueryCachedData } from "@/lib/convex/client";
import { useSafety } from "@/modules/safety";
import { Post } from "@ui/cards";
import { notEmpty } from "@utils/convex-allowed";
import { WEBSITE } from "global";
import { usePostHog } from "posthog-react-native";
import { Platform, Share, ViewStyle } from "react-native";

export const OutfitPost = ({ id, style }: { id: Id<'outfits'>, style?: ViewStyle }) => {
  const posthog = usePostHog();
  const { isHidden, reportContent, blockUser } = useSafety();

  const { userId } = useAccount();
  const { push } = useRouter('/feed');

  const { data: outfit } = useQuery(api.router.outfits.getOne.anon, { outfitId: id });
  const { data: user } = useQuery(api.router.users.getAccount.anon, outfit ? { userId: outfit.userId } : 'skip');
  const { data: isBookmarked } = useQuery(api.router.collection.getBookmarked.authed, { outfitId: id });
  const { mutate: toggleBookmark } = useMutation(api.router.collection.toggleBookmark.authed);
  const { data: wearCount } = useQuery(api.router.outfits.wearCount.anon, { outfitId: id });

  const { data: liked } = useQuery(api.router.likes.getLiked.authed, { outfitId: id });
  const { data: likes } = useQueryCachedData(api.router.likes.getLikes.anon, { outfitId: id, key: "likes" });
  const { mutate: toggleLike } = useMutation(api.router.likes.toggleLike.authed);

  const ownedByCurrentUser = outfit?.userId === userId;

  if (!outfit) return <Post.Skeleton style={{ ...style, paddingHorizontal: 12 }} />;

  if (isHidden({ outfitId: id, userId: outfit?.userId, itemIds: outfit?.items.map(i => i._id), outfit }))
    return <Post.Hidden
      src={outfit?.cover?.sizes.thumbnail.url}
      style={{ ...style, marginHorizontal: 12, aspectRatio: 3 / 4, borderRadius: 28 }}
    />;

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
    recreateCount={wearCount}
    image={cover}
    isBookmarked={isBookmarked}
    onToggleBookmark={() => toggleBookmark({ outfitId: id })}
    report={ownedByCurrentUser ? undefined : {
      outfitId: id,
      onReport: (data) => reportContent({
        reason: data.reason,
        generationId: data.generationId as Id<'generations'>,
        outfitId: data.outfitId as Id<'outfits'>,
        itemId: data.itemId as Id<'items'>,
        presetId: data.presetId as Id<'presets'>,
      }),
      onBlock: () => blockUser(outfit.userId),
    }}
    onToggleLike={(v) => toggleLike({ outfitId: id, value: v })}
    likedAccounts={likes?.latestLikers.map(l => l.image).filter(notEmpty)}
    isLiked={liked}
    onShare={() => {
      posthog.capture('post_share_button_pressed', { outfitId: id });
      const url = WEBSITE.URL + ROUTES.SHARE.OUTFIT(id);
      Share.share(Platform.OS === 'ios' ? {
        url,
        message: `Check out this outfit on Cooture!`,
      } : {
        title: `Check out this outfit on Cooture!`,
        message: url,
      })
    }}
    users={user ? [{
      name: user.name ?? 'Anonymous',
      username: user.username ?? 'anon',
      isPremium: user.isPremium,
      imageUrl: user.image,
      onPress: () => push(ROUTES.USER.PATH, {
        pathParams: { id: user!._id }
      })
    }] : undefined}
    onRecreate={() => push(ROUTES.PHOTOSHOOT.NEW, { params: { presetId: null, outfitId: outfit._id } })}
    outfit={{
      itemUrls: outfit.items.map(i => i.image.sizes.thumbnail.url),
      onPress: () => push(ROUTES.OUTFIT.PATH, { pathParams: { id: outfit._id } })
    }}
  // user={outfit.}
  />;
}