import { ROUTES, useRoute, useRouter, useStateEffect } from "@/hooks";
import { api, Id, useQuery } from "@/lib/convex/client";
import { useOutfit } from "@/modules/outfits/_hooks/useOutfit";
import { Block } from "@ui/block";
import { EmptyBlock } from "@ui/block.empty";
import { CardItem } from "@ui/cards/card-item";
import { FlashList, FlashListRef } from "@ui/flat-list";
import { Col, Grid } from "@ui/grid";
import { Camera, Globe, TShirt } from "@ui/icons";
import { ModalHeader } from "@ui/modal";
import { Pressable } from "@ui/pressable";
import { SafeAreaView } from "@ui/safe-area-view";
import { Skeleton } from "@ui/skeleton";
import { Text } from "@ui/text";
import { normalizeArray, notEmpty } from "@utils/convex-allowed";
import { Route, router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { Colors } from "theme";
import { useSearchItems } from "../_hooks/useSearchItems";
import { Categories } from "./categories";
import { ItemsValidator } from "./items-validator";
import { SearchInput } from "./search-input";

const PADDING_HORIZONTAL = 12;

function Content({ mode, outfitId }: { mode: 'new' | 'edit', outfitId?: Id<'outfits'> }) {
  const { outfit, updateItems } = useOutfit(outfitId ?? null);
  const { items } = useOutfit.New();
  const [innerItems, setInnerItems] = useStateEffect(mode === 'edit' ? outfit?.items.map((i) => i._id) ?? [] : items);

  const newDelay = Date.now() - 3 * 24 * 60 * 60 * 1000 // 3 days

  // Search
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const { results, isLoading, isEmpty } = useSearchItems({ query, category, channel: 'public' });

  // UI
  const listRef = useRef<FlashListRef<typeof results[number] | string>>(null);
  const [validatorOpen, setValidatorOpen] = useState(innerItems.length > 0);

  const { pathname } = useRoute.Path();
  const { redirect, push } = useRouter(pathname as Route);

  // Cost
  const { data: costData } = useQuery(api.router.credits.getCost.anon, { type: 'ITEM_CREATION_COST', amount: items.length + 1 });
  const { data: canPay } = useQuery(api.router.credits.canPay.authed, costData ? { amount: costData } : 'skip');

  return (
    <SafeAreaView
      edges={{ top: 'off', bottom: 'android' }}
      style={{ flex: 1, backgroundColor: Colors.blur.darkest }}
    >
      <FlashList
        ref={listRef}
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
        ListFooterComponent={(isLoading && results.length === 0) ? <Grid style={{
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
        data={["header", isEmpty ? "empty" : undefined, ...(results ?? [])].filter(notEmpty)}
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
                  category={category}
                  onCategoryChange={(category) => {
                    listRef.current?.scrollToTop({ animated: true });
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

          return (
            <View style={{
              marginBottom: 36,
              paddingTop: 3,
              marginLeft: 20 + (index % 2 === 0 ? 0 : PADDING_HORIZONTAL),
              marginRight: 20 + (index % 2 === 0 ? PADDING_HORIZONTAL : 0),
            }}>
              <CardItem
                image={item.image}
                source={item.image.sizes.small.url}
                // title={item.name}
                // subtitle={item.brand || item.category}
                selected={!!innerItems.find((i) => i === item._id)}
                badge={badge}
                onPress={() => {
                  setValidatorOpen(true);
                  setInnerItems((prev) => {
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
          disabled={innerItems.length === 0}
          items={innerItems.toReversed()}
          onItemRemoved={(item) => setInnerItems((prev) => {
            if (prev.length === 1) setValidatorOpen(false);
            return prev.filter((p) => p !== item);
          })}
          onPress={async (items) => {
            // Outfit creation is free
            // if (!canPay) { return push(ROUTES.MODALS.UPGRADE); }

            if (mode === 'new') {
              push(ROUTES.MODALS.NEW_OUTFIT, {
                forwardRedirect: true,
                params: { itemIds: items }
              });
              return;
            }

            await updateItems(items);
            redirect({
              params: { itemIds: items },
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

export default function Screen() {
  const { itemIds, outfitId } = useRoute("/add-item");

  const mode = outfitId ? 'edit' : 'new';

  const { setItems } = useOutfit.New();

  // Initialize items if itemIds are provided
  useEffect(() => {
    if (itemIds && itemIds.length > 0) setItems(normalizeArray(itemIds))
  }, [itemIds, setItems])

  return <Content mode={mode} outfitId={outfitId} />;
}