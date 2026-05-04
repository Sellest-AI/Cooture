import { useRouter } from "@/hooks"
import { api, Id, useQuery } from "@/lib/convex/client"
import { CardItem, Collection } from "@ui/cards"
import { FlashList, FlashListRef } from "@ui/flat-list"
import { Skeleton } from "@ui/skeleton"
import { Text } from "@ui/text"
import { notEmpty, ROUTES } from "@utils/convex-allowed"
import React, { ReactNode, useRef, useState } from "react"
import { useAnimatedValue, View } from "react-native"
import { Colors } from "theme"
import { SharedWrapper } from "./sharedWrapper"

type SharedFlashListProps<T extends object | string> = {
  header?: React.ComponentType;
  onScroll?: (value: number) => void;
  data: T[];
  renderItem: (item: T, index: number) => ReactNode;
  columns?: number;
  scrollRef?: React.RefObject<FlashListRef<any> | null>;
}
const SharedFlashList = <T extends object | string>({ header, data, onScroll, renderItem, columns, scrollRef }: SharedFlashListProps<T>) => {
  const loading = Array.from({ length: 4 }).map((_, i) => 'loading');
  const finalData = (data.length === 0 && !header) ? loading : [...data];

  const Header = header;

  return (
    <FlashList
      ref={scrollRef}
      onScroll={(value) => onScroll?.(value.nativeEvent.contentOffset.y)}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: 16, paddingBottom: 86 }}
      data={finalData.filter(notEmpty)}
      masonry
      numColumns={columns ?? 2}
      keyExtractor={(item, index) => `${(typeof item === "object" && "_id" in item) ? item._id : item.toString()}-${index}`}
      stickyHeaderIndices={[data.length]}
      stickyHeaderConfig={{
        hideRelatedCell: true,
        offset: 0,
      }}
      nestedScrollEnabled
      ListHeaderComponent={Header ? <Header /> : undefined}
      renderItem={({ item, index }) => {
        if (typeof item === 'string') {
          if (item === 'loading') return <View style={{
            paddingBottom: 8,
            paddingLeft: index % 2 === 0 ? 0 : 4,
            paddingRight: index % 2 === 0 ? 4 : 0,
            flex: 1,
          }}>
            <Skeleton style={{ flex: 1, aspectRatio: 4 / 5 }} />
          </View>
        }

        if (typeof item === 'string') return null;

        return renderItem(item, index) as unknown as null;
      }}
    />
  )
}

type HorizontalCarouselProps = {
  title?: string;
  outfit?: NonNullable<Props['outfits']>[number];
  items?: Props['items'];
}
const HorizontalCarousel = ({ title, outfit, items }: HorizontalCarouselProps) => {
  const { push } = useRouter();

  const itemIds = items ? [] : outfit?.items.map(i => i.itemId) ?? [];
  const { data: _items } = useQuery(api.router.items.getMany.anon, itemIds.length > 0 ? { itemIds } : 'skip');

  const data = [
    outfit ? { ...outfit, type: 'outfit' as const } : undefined,
    ...(items ?? _items)?.map(i => ({ ...i, type: 'item' as const }))
      .sort((a, b) => {
        if (a.position === 'ACCESSORY') return 1;
        if (b.position === 'ACCESSORY') return -1;
        return 1;
      })
    ?? itemIds.map(id => id),
  ].filter(notEmpty)

  return (
    <View style={{}}>
      {(outfit ?? title) && <Text.Base
        color={Colors.neutral[400]}
        weight={500}
        style={{
          marginLeft: 16,
          marginBottom: 16
        }}
      >
        {title ?? outfit?.name}
      </Text.Base>}
      <FlashList
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 12,
          alignItems: 'center',
          height: 156
        }}
        data={data ?? []}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => typeof item === 'string' ? item : item._id}
        renderItem={({ item }) => {
          if (typeof item === 'string') return (
            <View style={{ width: 120, height: 156, padding: 8 }}>
              <Skeleton style={{ width: '100%', height: '100%' }} />
            </View>
          )

          if (item.type === 'outfit') {
            return (
              <View style={{ width: 120, padding: 8, marginRight: 16 }}>
                <Collection
                  onPress={() => push(ROUTES.OUTFIT.PATH, { pathParams: { id: item._id } })}
                  backgroundColor={item.backgroundColor}
                  source={item.cover?.sizes.small.url}
                  style={{ width: 120, paddingBottom: 8 }}
                  contentFit="contain"
                />
              </View>
            )
          }

          const height = 156 - 16;
          const baseWidth = height * (item.image.width / item.image.height);
          const width = baseWidth > 120 ? 120 : baseWidth;

          return (
            <View style={{ width, height, marginHorizontal: 20, paddingVertical: 8 }}>
              <CardItem
                image={item.image}
                source={item.image.url}
                style={{ width, height }}
                onPress={() => {
                  push(ROUTES.ITEM.PATH, { pathParams: { id: item._id } })
                }}
              />
            </View>
          )
        }}
      />
    </View>
  )
}

type Props = {
  outfits?: { _id: Id<'outfits'>, name: string, backgroundColor?: string, cover: { sizes: { small: { url: string } } }, items: { itemId: Id<'items'> }[] }[];
  items?: { _id: Id<'items'>, name: string, position?: string, image: { url: string, width: number, height: number } }[];
  firstTab?: string;
  firstTabHeader?: React.ComponentType;
}

export const SharedScreen = ({ outfits, items, firstTab, firstTabHeader }: Props) => {
  const [tab, setTab] = useState<string>(firstTab || 'trending');
  const ref = useRef<FlashListRef<any>>(null);
  const opacity = useAnimatedValue(0);

  const outfitsData = outfits?.map((o) => ({ ...o, type: "outfit" as const })) ?? [];
  const itemsData = items?.map((i) => ({ ...i, type: "item" as const })) ?? [];

  const trendingData = [
    ...outfitsData.slice(0, 1),
    { items: itemsData.slice(0, 6), type: 'items' as const },
    ...outfitsData.slice(1, 2),
    { items: itemsData.slice(6, 12), type: 'items' as const },
    ...outfitsData.slice(2, 3),
    { items: itemsData.slice(12, 18), type: 'items' as const },
    ...outfitsData.slice(3, 4),
    { items: itemsData.slice(18, 24), type: 'items' as const },
    ...outfitsData.slice(4, 99),
  ].filter((v) => v.items?.length > 0);

  const { push } = useRouter();

  return (
    <SharedWrapper
      scrollRef={ref}
      scrollValue={opacity}
      tab={tab}
      onChangeTab={(tab) => setTab(tab as 'trending' | 'outfits' | 'items')}
      tabs={[
        firstTab ? { label: firstTab.slice(0, 1).toUpperCase() + firstTab.slice(1), value: firstTab } :
          { label: 'Trending', value: 'trending' },
        { label: 'Outfits', value: 'outfits' },
        { label: 'Items', value: 'items' },
      ]}
    >
      {tab === 'outfits' && <SharedFlashList
        scrollRef={ref}
        onScroll={(value) => opacity.setValue(value)}
        data={outfitsData}
        renderItem={(item, index) => (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: 24,
            paddingTop: 12,
            paddingLeft: index % 2 === 0 ? 8 : 16,
            paddingRight: index % 2 === 0 ? 16 : 8,
          }}>
            <Collection
              onPress={() => push(ROUTES.OUTFIT.PATH, { pathParams: { id: item._id } })}
              backgroundColor={item.backgroundColor}
              source={item.cover.sizes.small.url}
              title={item.name}
              style={{ width: '100%' }}
              contentFit="contain"
            />
          </View>
        )}
      />}
      {tab === 'items' && <SharedFlashList
        scrollRef={ref}
        onScroll={(value) => opacity.setValue(value)}
        data={itemsData}
        renderItem={(item) => (
          <View style={{
            flexDirection: 'row',
            marginBottom: 40,
            paddingLeft: 12,
            paddingRight: 12,
          }}>
            <CardItem
              image={item.image}
              source={item.image.url}
              // badge={badge}
              onPress={() => {
                push(ROUTES.ITEM.PATH, { pathParams: { id: item._id } })
              }}
            />
          </View>
        )}
      />}
      {['trending', firstTab].includes(tab) && <SharedFlashList
        header={firstTabHeader}
        scrollRef={ref}
        onScroll={(value) => opacity.setValue(value)}
        data={trendingData}
        columns={1}
        renderItem={(item) => {
          if (item.type === 'outfit')
            return (
              <View style={{
                flex: 1,
                justifyContent: 'center',
                marginBottom: 28,
                width: '100%',
              }}>
                <HorizontalCarousel outfit={item} />
              </View>)

          if (item.type === 'items')
            return (
              <View style={{
                flex: 1,
                justifyContent: 'center',
                marginBottom: 28,
                width: '100%',
              }}>
                <HorizontalCarousel
                  title={"Trending items"}
                  items={item.items}
                />
              </View>)
        }}
      />}
    </SharedWrapper>
  )
}