import { ROUTES, useRouter } from "@/hooks";
import { api, usePaginatedQuery, useQueryCached } from "@/lib/convex/client";
import { Collection } from "@ui/cards";
import { FlashList } from "@ui/flat-list";
import { Pressable } from "@ui/pressable";
import { Skeleton } from "@ui/skeleton";
import { Text } from "@ui/text";
import { useMemo } from "react";
import { DimensionValue, FlatList, View, ViewStyle } from "react-native";
import { Colors } from "theme";

const PADDING_HORIZONTAL = 12;
const GAP = 32;

type Props = {
  style?: ViewStyle;
  direction: 'horizontal' | 'vertical';
  numColumns?: number;
  header?: boolean;
  itemWidth: DimensionValue;
  initialNumItems?: number;
}

export const SavedOutfits = ({ style, direction, numColumns, header, itemWidth, initialNumItems = 6 }: Props) => {
  const { push } = useRouter();
  const { results, isLoading, loadMore } = usePaginatedQuery(api.router.collection.getBookmarks.authed, { type: 'outfit' }, { initialNumItems });

  const Item = useMemo(() => function ChildItem({ outfitId }: NonNullable<typeof results>[number]) {
    const { data: item } = useQueryCached(api.router.outfits.getOne.anon, { outfitId: outfitId! });

    if (!item || !item.cover)
      return <Skeleton style={{ width: itemWidth, aspectRatio: 4 / 5 }} />

    return (
      <Collection
        onPress={() => push(ROUTES.OUTFIT.PATH, {
          pathParams: { id: item._id }
        })}
        backgroundColor={item.backgroundColor}
        source={item.cover?.sizes.small.url}
        title={item.name}
        style={{ width: itemWidth }}
        contentFit="contain"
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
          Saved Outfits
        </Text.H4>
        <Pressable onPress={() => push(ROUTES.COLLECTION.SAVED_OUTFITS)}>
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
          paddingLeft: PADDING_HORIZONTAL + 4,
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
          paddingLeft: PADDING_HORIZONTAL - 4,
          paddingRight: PADDING_HORIZONTAL - 4,
          paddingBottom,
        }}
        data={(results || [])}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={{
            paddingLeft: PADDING_HORIZONTAL + 8,
            paddingRight: PADDING_HORIZONTAL + 8,
            marginBottom: GAP,
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
            flex: 1,
          }}>
            <Item {...item} />
          </View>
        )}
      />}
    </View>
  )
}
