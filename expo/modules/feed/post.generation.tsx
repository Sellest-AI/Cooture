import { ROUTES, useRouter } from "@/hooks";
import { api, Id } from "@/lib/convex/api";
import { useMutation, useQuery, useQueryCached, useQueryCachedData } from "@/lib/convex/client";
import { Post } from "@ui/cards";
import { notEmpty } from "@utils/convex-allowed";
import { ViewStyle } from "react-native";

type Props = {
  id: Id<'generations'>;
  style?: ViewStyle;
  imageQuality?: 'optimized' | 'full';
}

export const GenerationPost = ({ id, style, imageQuality = 'optimized' }: Props) => {
  const { push } = useRouter('/feed');
  const { data: post } = useQuery(api.router.generations.getOne.anon, { id });
  const imageIds = post?.predictions.map((p) => p.imageId).filter(notEmpty) ?? [];
  const { data: images } = useQueryCached(api.router.storage.images.getMany.anon, imageIds.length > 0 ? { imageIds } : 'skip');

  const { data: isBookmarked } = useQuery(api.router.inventory.getBookmarked.authed, { generationId: id });
  const { mutate: toggleBookmark } = useMutation(api.router.inventory.toggleBookmark.authed);

  const { data: liked } = useQuery(api.router.likes.getLiked.authed, { generationId: id });
  const { data: likes } = useQueryCachedData(api.router.likes.getLikes.anon, { generationId: id, key: "likes" });
  const { mutate: toggleLike } = useMutation(api.router.likes.toggleLike.authed);

  if (!post || !images) return <Post.Skeleton style={{ ...style, paddingHorizontal: 12 }} />;

  return (<Post
    style={{ ...style }}
    paddingHorizontal={12}
    postedAt={post.completedAt ? new Date(post.completedAt) : undefined}
    likedAccounts={likes?.latestLikers.map(l => l.image).filter(notEmpty)}
    isBookmarked={isBookmarked}
    onToggleBookmark={() => toggleBookmark({ generationId: id })}
    onToggleLike={(v) => toggleLike({ generationId: id, value: v })}
    isLiked={liked}
    // onShare={async () => {    }}
    images={images?.map((img) => ({
      _id: post.predictions.find(p => p.imageId === img._id)?._id ?? post.predictions[0]?._id,
      url: imageQuality === 'full' ? img.url : img.sizes.large.url,
      contentFit: img.hasAlpha ? 'contain' : 'cover',
    }))}
    users={post.users.map((user) => ({
      name: user.name ?? 'Anonymous',
      username: user.name ?? 'anon',
      imageUrl: user.image,
      onPress: () => push(ROUTES.USER.PATH, {
        pathParams: { id: user!._id }
      })
    }))}
    preset={post.preset?.cover ? {
      imageUrl: post.preset.cover.sizes.thumbnail.url,
      onPress: () => push(ROUTES.PHOTOSHOOT.RECAP, {
        params: { presetId: post.preset?._id, outfitId: post.outfit?._id }
      })
    } : undefined}
    outfit={post.outfit ? {
      itemUrls: post.outfit.items.map(i => i.image.sizes.thumbnail.url),
      onPress: () => push(ROUTES.OUTFIT.PATH, {
        pathParams: { id: post.outfit!._id }
      })
    } : undefined}
  />
  )
}