import { ROUTES, useRouter } from "@/hooks";
import { api, usePaginatedQuery, useQuery, useQueryCached } from "@/lib/convex/client";
import { PostMini } from "@ui/cards";
import { FlashList } from "@ui/flat-list";
import { Pressable } from "@ui/pressable";
import { Text } from "@ui/text";
import { notEmpty } from "@utils/convex-allowed";
import { useMemo } from "react";
import { DimensionValue, FlatList, View, ViewStyle } from "react-native";
import { Colors } from "theme";

const PADDING_HORIZONTAL = 12;
const GAP = 24;

type Props = {
  style?: ViewStyle;
  direction: 'horizontal' | 'vertical';
  numColumns?: number;
  header?: boolean;
  itemWidth: DimensionValue;
  initialNumItems?: number;
}

export const SavedPosts = ({ style, direction, numColumns, header, itemWidth, initialNumItems = 6 }: Props) => {
  const { push } = useRouter();
  const { results, isLoading, loadMore } = usePaginatedQuery(api.router.collection.getBookmarks.authed, { type: 'generation' }, { initialNumItems });

  const Item = useMemo(() => function ChildItem({ generationId }: NonNullable<typeof results>[number]) {
    const { data: generation } = useQueryCached(api.router.generations.getOne.anon, { id: generationId! });
    const { data: _image } = useQuery(api.router.storage.images.getOne.anon, generation?.coverId ? { id: generation.coverId } : 'skip');
    const { data: user } = useQuery(api.router.users.getAccount.anon, generation ? { userId: generation.userId } : 'skip');

    const image = _image ? {
      ..._image,
      url: _image.sizes.small.url,
    } : undefined;

    if (!generation)
      return <PostMini.Skeleton style={{
        width: itemWidth,
        aspectRatio: 4 / 5,
      }}
      />

    return (
      <PostMini
        style={{ width: itemWidth }}
        onPress={() => push(ROUTES.POST.PATH, { pathParams: { id: generation.firstPredictionId } })}
        images={generation?.predictions.length > 1 ? [image, image].filter(notEmpty) : undefined}
        image={image}
        users={user ? [{
          ...user,
          onPress: () => push(ROUTES.PROFILE.PATH, { pathParams: { id: user._id } }),
          imageUrl: user.image,
          name: user.name ?? 'Anonymous',
          username: user.username ?? 'anonymous',
        }] : undefined}
      />
    )
  }, [push, itemWidth]);

  if (!isLoading && (results.length === 0)) return null;

  const { paddingBottom, ...restStyle } = style || {};

  return (
    <View style={{ ...restStyle }}>
      {header && <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: PADDING_HORIZONTAL,
        marginBottom: 20,
      }}
      >
        <Text.H4 color={Colors.foreground}>
          Saved Posts
        </Text.H4>
        <Pressable onPress={() => push(ROUTES.COLLECTION.SAVED_POSTS)}>
          <Text.Base color={Colors.neutral[200]} weight={600}>
            See more
          </Text.Base>
        </Pressable>
      </View>}
      {direction === "horizontal" && <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 10,
          paddingLeft: PADDING_HORIZONTAL,
          paddingRight: PADDING_HORIZONTAL + 12,
          gap: GAP,
        }}
        data={(results || [])}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Item {...item} />
        )}
      />}
      {direction === "vertical" && <FlashList
        onEndReached={() => loadMore(12)}
        numColumns={numColumns}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 10,
          paddingLeft: PADDING_HORIZONTAL,
          paddingRight: PADDING_HORIZONTAL,
          paddingBottom,
        }}
        data={(results || [])}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={{
            marginBottom: GAP,
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
            paddingHorizontal: PADDING_HORIZONTAL,
            flex: 1,
          }}>
            <Item {...item} />
          </View>
        )}
      />}
    </View>
  )
}