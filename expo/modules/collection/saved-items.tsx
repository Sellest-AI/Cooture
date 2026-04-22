import { ROUTES, useRouter } from "@/hooks";
import { api, Id, usePaginatedQuery, useQueryCached } from "@/lib/convex/client";
import { CardItem } from "@ui/cards";
import { FlashList } from "@ui/flat-list";
import { Pressable } from "@ui/pressable";
import { Skeleton } from "@ui/skeleton";
import { Text } from "@ui/text";
import { useMemo } from "react";
import { DimensionValue, FlatList, View, ViewStyle } from "react-native";
import { Colors } from "theme";

const PADDING_HORIZONTAL = 12;

type Props = {
  style?: ViewStyle;
  direction: 'horizontal' | 'vertical';
  numColumns?: number;
  header?: boolean;
  itemWidth: DimensionValue;
  initialNumItems?: number;
}

export const SavedItems = ({ style, direction, numColumns, header, itemWidth, initialNumItems = 6 }: Props) => {
  const { push } = useRouter();
  const { results, isLoading, loadMore } = usePaginatedQuery(api.router.collection.getBookmarks.authed, { type: 'item' }, { initialNumItems });

  const Item = useMemo(() => function ChildItem({ itemId, showText, style }: { itemId: Id<'items'>, showText?: boolean, style?: ViewStyle }) {
    const { data: item } = useQueryCached(api.router.items.getOne.anon, { itemId });

    if (!item || !item.image)
      return <Skeleton style={{ width: itemWidth, aspectRatio: 10 / 9 }} />

    return (
      <CardItem
        onPress={() => push(ROUTES.ITEM.PATH, {
          pathParams: { id: item._id }
        })}
        source={item.image.sizes.small.url}
        image={item.image.sizes.small}
        title={showText ? item.name : undefined}
        subtitle={showText ? item.category.replaceAll("_", " ") : undefined}
        style={style}
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
          Saved Items
        </Text.H4>
        <Pressable onPress={() => push(ROUTES.COLLECTION.SAVED_ITEMS)}>
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
          paddingLeft: PADDING_HORIZONTAL + 6,
          paddingRight: PADDING_HORIZONTAL + 12,
          gap: 16,
        }}
        data={(results || [])}
        ListEmptyComponent={<>
          <Skeleton style={{ width: itemWidth, aspectRatio: 10 / 9 }} />
          <Skeleton style={{ width: itemWidth, aspectRatio: 10 / 9 }} />
          <Skeleton style={{ width: itemWidth, aspectRatio: 10 / 9 }} />
        </>}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          if (!item.itemId) return null;
          return (
            <View style={{ width: itemWidth, aspectRatio: 10 / 9 }}>
              <Item
                itemId={item.itemId}
                style={{ height: '100%' }}
                showText={false}
              />
            </View>
          )
        }}
      />}
      {direction === "vertical" && <FlashList
        onEndReached={() => loadMore(12)}
        numColumns={numColumns}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 10,
          paddingLeft: PADDING_HORIZONTAL - 4,
          paddingRight: PADDING_HORIZONTAL - 4,
          paddingBottom,
        }}
        data={(results || [])}
        keyExtractor={(item) => item._id}
        masonry
        renderItem={({ item, index }) => {
          if (!item.itemId) return null;

          return (
            <View style={{
              paddingLeft: index % 2 === 0 ? 12 : 24,
              paddingRight: index % 2 === 0 ? 24 : 12,
              marginBottom: 40,
            }}>
              <Item
                itemId={item.itemId}
                showText={true}
              />
            </View>
          )
        }}
      />}
    </View>
  )
}
