import { ROUTES, useRouter } from "@/hooks";
import { api, Id } from "@/lib/convex/api";
import { useMutation, useQuery, useQueryCached, useQueryCachedData } from "@/lib/convex/client";
import { downloadImageCrossPlatform } from "@/lib/image/client";
import { Post } from "@ui/cards";
import { notEmpty } from "@utils/convex-allowed";
import { env } from "env";
import { WEBSITE } from "global";
import { usePostHog } from "posthog-react-native";
import { Platform, Share, ViewStyle } from "react-native";

type Props = {
  id: Id<'generations'>;
  style?: ViewStyle;
  imageQuality?: 'optimized' | 'full';
  /** Disable long press if the current view is the post */
  disableLongPress?: boolean;
  ownedByCurrentUser?: boolean;
}

export const GenerationPost = ({ id, style, imageQuality = 'optimized', disableLongPress, ownedByCurrentUser }: Props) => {
  const posthog = usePostHog();
  const { push } = useRouter('/feed');
  const { data: post } = useQuery(api.router.generations.getOne.anon, { id });

  const imageIds = post?.predictions.map((p) => p.imageId).filter(notEmpty) ?? [];
  const { data: images } = useQueryCached(api.router.storage.images.getMany.anon, imageIds.length > 0 ? { imageIds } : 'skip');

  const videoIds = post?.predictions.map((p) => p.videoId).filter(notEmpty) ?? [];
  const { data: videos } = useQueryCached(api.router.storage.videos.getMany.anon, videoIds.length > 0 ? { videoIds } : 'skip');

  const { data: recreateCount } = useQuery(api.router.presets.recreateCount.anon, post?.presetId ? { presetId: post?.presetId } : 'skip');
  const { data: isBookmarked } = useQuery(api.router.collection.getBookmarked.authed, { generationId: id });
  const { mutate: toggleBookmark } = useMutation(api.router.collection.toggleBookmark.authed);

  const { data: liked } = useQuery(api.router.likes.getLiked.authed, { generationId: id });
  const { data: likes } = useQueryCachedData(api.router.likes.getLikes.anon, { generationId: id, key: "likes" });
  const { mutate: toggleLike } = useMutation(api.router.likes.toggleLike.authed);

  if (!post || !images) return <Post.Skeleton style={{ ...style, paddingHorizontal: 12 }} />;

  return (<Post
    style={{ ...style }}
    paddingHorizontal={12}
    postedAt={post.completedAt ? new Date(post.completedAt) : undefined}
    recreateCount={recreateCount}
    isBookmarked={isBookmarked}
    onToggleBookmark={() => toggleBookmark({ generationId: id })}
    onToggleLike={(v) => toggleLike({ generationId: id, value: v })}
    likedAccounts={likes?.latestLikers.map(l => l.image).filter(notEmpty)}
    isLiked={liked}
    onShare={(_id) => {
      posthog.capture('post_share_button_pressed', { generationId: id });
      const url = WEBSITE.URL + ROUTES.SHARE.POST(_id);
      Share.share(Platform.OS === 'ios' ? {
        url,
        message: `Check out this post on Cooture!`,
      } : {
        title: `Check out this post on Cooture!`,
        message: url,
      })
    }}
    images={images?.map((img) => ({
      _id: post.predictions.find(p => p.imageId === img._id)?._id ?? post.predictions[0]?._id,
      url: imageQuality === 'full' ? img.url : img.sizes.large.url,
      contentFit: img.hasAlpha ? 'contain' : 'cover',
    }))}
    videos={videos?.map((video) => ({
      _id: post.predictions.find(p => p.videoId === video._id)?._id ?? post.predictions[0]?._id,
      url: video.url,
    }))}
    users={post.users.map((user) => ({
      name: user.name ?? 'Anonymous',
      username: user.username ?? 'anon',
      imageUrl: user.image,
      isPremium: user.isPremium,
      onPress: () => push(ROUTES.USER.PATH, {
        pathParams: { id: user!._id }
      })
    }))}
    onDownload={async (url) => {
      await downloadImageCrossPlatform(url).catch(() => null)
    }}
    onTurnToVideo={(ownedByCurrentUser && env.PUBLIC_NODE_ENV !== 'production') ? (_id: string) => {
      const prediction = post.predictions.find(p => p._id === _id);
      if (!prediction) return;
      push(ROUTES.MODALS.TURN_TO_VIDEO, { params: { predictionId: prediction._id } })
    } : undefined}
    onRecreate={() => push(ROUTES.PHOTOSHOOT.RECAP, {
      params: { presetId: post.preset?._id, outfitId: post.outfit?._id }
    })}
    preset={post.preset?.cover ? {
      imageUrl: post.preset.cover.sizes.thumbnail.url,
      onPress: () => push(ROUTES.PRESETS.ID.PATH, {
        pathParams: { id: post.preset!._id },
      }),
    } : undefined}
    outfit={post.outfit ? {
      itemUrls: post.outfit.items.map(i => i.image.sizes.thumbnail.url),
      onPress: () => push(ROUTES.OUTFIT.PATH, { pathParams: { id: post.outfit!._id } })
    } : undefined}
  />
  )
}