import { ROUTES, useRoute, useRouter } from "@/hooks";
import { api, Id, useQuery, useQueryCached } from "@/lib/convex/client";
import { useOutfit } from "@/modules/outfits/_hooks/useOutfit";
import { useSafety } from "@/modules/safety";
import { Block } from "@ui/block";
import { EmptyBlock } from "@ui/block.empty";
import { CardItem } from "@ui/cards/card-item";
import { FlashList, FlashListRef } from "@ui/flat-list";
import { Col, Grid } from "@ui/grid";
import { BookmarkIcon, Camera, Globe, Loader, TShirt, X } from "@ui/icons";
import { Image } from "@ui/image";
import { ModalHeader } from "@ui/modal";
import { AnimatePresence, MotiView } from "@ui/motion";
import { Pressable } from "@ui/pressable";
import { SafeAreaView } from "@ui/safe-area-view";
import { Skeleton } from "@ui/skeleton";
import { Text } from "@ui/text";
import { hslToHex, notEmpty, parseColorToHsl } from "@utils/convex-allowed";
import { COLOR_TAGS } from "@utils/convex-allowed/lib/color";
import { Route, router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { View, ViewStyle } from "react-native";
import { Colors } from "theme";
import { useItem } from "../_hooks/useItem";
import { useSearchItems } from "../_hooks/useSearchItems";
import { Categories } from "./categories";
import { ItemsValidator } from "./items-validator";
import { SearchInput } from "./search-input";

const PADDING_HORIZONTAL = 12;
const MAX_ITEMS = 6;

function PendingItems() {
  const { pendingItems, newItems, reset } = useItem.Create();
  const { setItems } = useOutfit.New();

  useEffect(() => {
    if (newItems.length === 0) return;
    setItems((prev) =>
      Array.from(new Set([...prev, ...newItems.map((i) => i._id)])));
  }, [newItems, setItems])

  useEffect(() => {
    if (newItems.length === 0) return;
    if (pendingItems.length === 0) return;
    if (newItems.length < pendingItems.length) return;
    reset();
  }, [newItems, newItems.length, pendingItems.length, reset, setItems])

  const pendingLength = pendingItems.length - newItems.length;

  if (pendingLength <= 0) return null;

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 32 }}>
      <View style={{ position: 'relative', width: 20, height: 20 }}>
        <Loader size={20} color={Colors.primary[500]} />
      </View>
      <Text.Base color={Colors.neutral[400]} style={{ marginLeft: 4 }}>
        Adding {pendingLength} item{pendingLength > 1 ? 's' : ''} to your wardrobe
      </Text.Base>
    </View>
  )
}

const ColorPicker = ({ style, hexColor, onPress }: { style?: ViewStyle, hexColor?: string, onPress: (hexColor: null | string) => void }) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      ...style
    }}>
      <Pressable
        onLongPress={() => { onPress(null); setOpen(false); }}
        onPress={() => { setOpen((v) => !v); }}
        intensity={0.9}
        style={{
          width: 24,
          height: 24,
          borderRadius: 99,
          backgroundColor: open ? undefined : hexColor || Colors.blur.dark,
          overflow: 'hidden',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {(!open && !hexColor) && <Image
          source={require('assets/images/palette-gradient.jpg')}
          style={{ width: '100%', height: '100%', opacity: 0.8 }}
        />}
        {open && <X size={24} color={Colors.neutral[400]} />}
      </Pressable>
      <AnimatePresence>
        {open && <MotiView
          from={{ width: 0, opacity: 0, paddingHorizontal: 8, marginLeft: 4 }}
          animate={{ width: COLOR_TAGS.length * (28 + 8) + 24, opacity: 1, marginLeft: 8, paddingHorizontal: 12 }}
          exit={{ width: 0, opacity: 0, paddingHorizontal: 0, marginLeft: 0 }}
          style={{
            overflow: 'hidden',
            flexDirection: 'row',
            gap: 8,
            padding: 6,
            paddingHorizontal: 12,
            borderRadius: 999,
            backgroundColor: Colors.blur.dark,
            borderLeftWidth: 1,
            borderColor: Colors.blur.medium,
            opacity: 1,
            marginLeft: 8,
          }}>
          {COLOR_TAGS.map((color, i) => {
            const rgb = `rgb(${color.r}, ${color.g}, ${color.b})`;
            const hsl = parseColorToHsl(rgb);

            if (!hsl) return null;

            const hex = hslToHex(...hsl);

            const selected = hexColor === hex;

            return (
              <Pressable
                style={{ width: selected ? 22 : 28 }}
                key={color.tag}
                intensity={0.9}
                onPress={() => {
                  if (selected) setOpen(false);
                  onPress(selected ? null : hex);
                }}
              >
                <View
                  style={{
                    width: selected ? 22 : 28,
                    height: 22,
                    borderRadius: 99,
                    backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`
                  }}
                />
              </Pressable>
            )
          })}
        </MotiView>}
      </AnimatePresence>
    </View>
  )
}

const newDelay = Date.now() - 3 * 24 * 60 * 60 * 1000 // 3 days

function Content({ outfitId }: { outfitId?: Id<'outfits'> }) {
  const { updateItems } = useOutfit(outfitId ?? null);
  const { items, setItems } = useOutfit.New();
  const { latestItems } = useItem.Create();

  // Search
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [hexColor, setColor] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const { results, isLoading, isFiltering, isEmpty, onLoadMore } = useSearchItems({ query, category, hexColor, bookmarked, channel: 'public' });

  const { isHidden } = useSafety();
  const itemsLibrary = [...(isFiltering ? [] : latestItems), ...results] // unique;
    .filter((item, i, arr) => arr.findIndex(it => it._id === item._id) === i)
    .filter((item) => !isHidden({ itemId: item._id, userId: item.userId, item }));

  // UI
  const listRef = useRef<FlashListRef<typeof itemsLibrary[number] | string>>(null);
  const [validatorOpen, setValidatorOpen] = useState(items.length > 0);

  const { pathname } = useRoute.Path();
  const { redirect, push } = useRouter(pathname as Route);

  // Cost
  const { data: costData } = useQueryCached(api.router.credits.getCost.anon, { type: 'ITEM_CREATION_COST' });
  const { data: canPay } = useQuery(api.router.credits.canPay.authed, costData ? { amount: costData } : 'skip');

  return (
    <SafeAreaView
      edges={{ top: 'off', bottom: 'android' }}
      style={{ flex: 1, backgroundColor: Colors.blur.darkest }}
    >
      <FlashList
        ref={listRef}
        onEndReached={onLoadMore}
        ListHeaderComponent={<View style={{ marginHorizontal: PADDING_HORIZONTAL }}>
          <ModalHeader
            title="Select items"
            onBack={router.canGoBack() ? () => { router.back() } : undefined}
            style={{ marginBottom: 0, marginTop: 16 }}
          />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, marginBottom: 4, }}>
            <HeaderButton
              icon={Camera}
              label="Import item"
              onPress={() => {
                if (!canPay) push(ROUTES.MODALS.UPGRADE);
                else push(ROUTES.SCAN, { forwardRedirect: true })
              }}
            />
            <HeaderButton
              icon={Globe}
              label="Search online"
              onPress={() => {
                if (!canPay) push(ROUTES.MODALS.UPGRADE);
                else push(ROUTES.OUTFIT.BROWSER, { forwardRedirect: true })
              }}
            />
          </View>
        </View>}
        ListFooterComponent={isLoading ? <Grid style={{
          height: 0,
          flex: 1,
          paddingHorizontal: PADDING_HORIZONTAL,
          gap: 24
        }}>
          <Col>
            <Skeleton style={{ marginBottom: 28, height: 300 }} />
            <Skeleton style={{ marginBottom: 28, height: 300 }} />
          </Col>
          <Col>
            <Skeleton style={{ marginBottom: 28, height: 200 }} />
            <Skeleton style={{ marginBottom: 28, height: 400 }} />
          </Col>
        </Grid> : undefined}
        stickyHeaderIndices={[0]}
        stickyHeaderHiddenOnScroll={true}
        stickyHeaderConfig={{
          hideRelatedCell: true,
          useNativeDriver: true,
          offset: 12
        }}
        onScrollBeginDrag={() => setValidatorOpen(false)}
        overrideItemLayout={(layout, item, index) => {
          if (typeof item === "string") { layout.span = 2; }
        }}
        data={["header", "pending", isEmpty ? "empty" : undefined, ...(itemsLibrary ?? [])].filter(notEmpty)}
        contentContainerStyle={{ paddingBottom: 56 }}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => typeof item === "string" ? item : item._id}
        renderItem={({ item, index }) => {
          if (typeof item === "string") {
            if (item === "empty")
              return <EmptyBlock
                style={{ marginTop: 64 }}
                icon={TShirt}
                title="No items found"
                description="Try adjusting your search or check back later"
                variant="secondary"
              />

            if (item === "pending")
              return <PendingItems />

            if (item === "header")
              return <>
                <SearchInput
                  value={query}
                  onBlur={setQuery}
                  isLoading={isLoading}
                  style={{
                    marginHorizontal: PADDING_HORIZONTAL
                  }}
                />
                <Categories
                  extraCategories={{
                    bookmarks: <Pressable
                      style={{ paddingRight: 10, paddingVertical: 4 }}
                      onPress={() => {
                        listRef.current?.scrollToTop({ animated: true });
                        setBookmarked((b) => !b);
                        setCategory(null);
                        setColor(null);
                      }}>
                      <BookmarkIcon
                        color={bookmarked ? Colors.primary[500] : Colors.neutral[400]}
                        weight={bookmarked ? 'fill' : 'regular'}
                        size={24}
                      />
                    </Pressable>,
                    colors: <ColorPicker
                      hexColor={hexColor ?? undefined}
                      onPress={(hex) => {
                        listRef.current?.scrollToTop({ animated: true });
                        setBookmarked(false);
                        setColor(hex);
                      }}
                      style={{ marginRight: 12 }}
                    />
                  }}
                  category={category}
                  onCategoryChange={(category) => {
                    listRef.current?.scrollToTop({ animated: true });
                    setBookmarked(false);
                    setCategory(category);
                  }}
                  style={{
                    marginTop: 8,
                    marginBottom: 28,
                    paddingHorizontal: PADDING_HORIZONTAL
                  }}
                />
              </>;

            return null;
          }

          const badgeNew = item._creationTime > newDelay ? "New" : undefined;
          const badge = badgeNew;

          // For items with a very vertical aspect ratio, we want to use the medium size
          const isTall = Number(item.image.aspectRatio.actual) < 4 / 6;
          const imageUrl = isTall ? item.image.sizes.medium.url : item.image.sizes.small.url;

          return (
            <View style={{
              marginBottom: 36,
              paddingTop: 3,
              marginLeft: 20 + (index % 2 === 0 ? 0 : PADDING_HORIZONTAL),
              marginRight: 20 + (index % 2 === 0 ? PADDING_HORIZONTAL : 0),
            }}>
              <CardItem
                image={item.image}
                source={imageUrl}
                // title={item.name}
                // subtitle={item.brand || item.category}
                selected={!!items.find((i) => i === item._id)}
                badge={badge}
                onLongPress={() => {
                  push(ROUTES.ITEM.PATH, {
                    pathParams: { id: item._id }
                  })
                }}
                onPress={() => {
                  setValidatorOpen(true);
                  setItems((prev) => {
                    if (prev.find((i) => i === item._id)) {
                      return prev.filter((i) => i !== item._id);
                    } else {
                      return [...prev, item._id];
                    }
                  });
                }}
              />
            </View>
          )
        }}
        optimizeItemArrangement={true}
        numColumns={2}
        masonry
      />
      <View style={{
        position: 'absolute',
        left: 8,
        right: 8,
        bottom: 8
      }}>
        <ItemsValidator
          open={validatorOpen}
          onOpenChange={setValidatorOpen}
          maxItems={MAX_ITEMS}
          items={items.toReversed()}
          onItemRemoved={(item) => setItems((prev) => {
            if (prev.length === 1) setValidatorOpen(false);
            return prev.filter((p) => p !== item);
          })}
          onPress={async (items) => {
            // Outfit creation is free
            // if (!canPay) { return push(ROUTES.MODALS.UPGRADE); }

            if (!outfitId) {
              push(ROUTES.MODALS.NEW_OUTFIT, {
                forwardRedirect: true,
                params: { itemIds: items }
              });
              return;
            }

            await updateItems(items);
            redirect({
              params: { itemIds: items, outfitId },
              pathParams: { id: outfitId },
              fallbackTo: ['back', '/'],
              resetNextRoute: false
            });
          }}
        />
      </View>
    </SafeAreaView>
  )
}

const HeaderButton = ({ label, icon, onPress }: { onPress: () => void, label: string, icon: React.ComponentType<{ size?: number, color?: string }> }) => {
  const Icon = icon;
  return (
    <Pressable onPress={onPress} style={{ flex: 1 }}>
      <Block
        variant="blur"
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 24,
          paddingHorizontal: 16,
          paddingVertical: 24,
          flex: 1,
          gap: 10
        }}
      >
        <Icon size={28} color={Colors.neutral[400]} />
        <Text.Base color={Colors.neutral[50]} weight={500}>{label}</Text.Base>
      </Block>
    </Pressable>
  )
}

type Props = { outfitId?: Id<'outfits'> };
export default function Screen({ outfitId }: Props) {
  return <Content outfitId={outfitId} />;
}