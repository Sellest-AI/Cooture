import { ROUTES, useDebounce, useRoute, useRouter, useStateEffect } from "@/hooks";
import { api, useQuery, useQueryCachedData } from "@/lib/convex/client";
import { useOutfit } from "@/modules/outfits/_hooks/useOutfit";
import { Button } from "@ui/button";
import { CardItem } from "@ui/cards/card-item";
import { FlashList } from "@ui/flat-list";
import { Loader, Search } from "@ui/icons";
import { ModalHeader } from "@ui/modal";
import { SafeScrollView } from "@ui/safe-scroll-view";
import { TextInput } from "@ui/text-input";
import { normalizeArray } from "@utils/convex-allowed";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Colors } from "theme";

export default function AddItemScreen() {
  const { redirect, dismissTo } = useRouter("/add-item");
  const { outfitId, itemIds } = useRoute("/add-item");
  const { data: _items } = useQueryCachedData(api.router.items.getAll.authed, { key: "getAllItems" });

  const mode = outfitId ? 'edit' : 'new';

  const { outfit, updateItems } = useOutfit(outfitId ?? null);
  const { setItems, items } = useOutfit.New();
  const [innerItems, setInnerItems] = useStateEffect(mode === 'edit' ? outfit?.items.map((i) => i._id) ?? [] : items);

  // Initialize items if itemIds are provided
  useEffect(() => { if (itemIds && itemIds.length > 0) setItems(normalizeArray(itemIds)) }, [itemIds, setItems])

  const newDelay = Date.now() - 3 * 24 * 60 * 60 * 1000 // 3 days

  // Search
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 800);
  const query = search !== debouncedSearch ? '' : search;
  const hasQuery = query.length > 0;
  const { data: searchResults } = useQuery(api.router.items.searchMany.anon, query ? { query } : 'skip');
  const isLoading = hasQuery && !searchResults;

  const data = (hasQuery ? searchResults : _items) as typeof _items;

  return (
    <View style={{
      flex: 1,
      backgroundColor: Colors.blur.darkest,
    }}>
      <SafeScrollView
        showsVerticalScrollIndicator={false}
        edges={{ top: 'off' }}
        style={{
          padding: 12,
        }}
      >
        <ModalHeader
          title="Choose items"
          onBack={router.canGoBack() ? () => { router.back() } : undefined}
        />
        <TextInput
          startIcon={isLoading ? Loader : Search}
          value={search}
          onChangeText={setSearch}
          placeholder="Search for items..."
          style={{
            marginBottom: 12,
          }}
        />
        <FlashList
          data={data ?? []}
          style={{ paddingHorizontal: 8, paddingBottom: 56, marginTop: 16 }}
          renderItem={({ item }) => {
            const badgeNew = item._creationTime > newDelay ? "New" : undefined;
            const badge = badgeNew;

            return (
              <View style={{
                marginBottom: 36,
                paddingTop: 3,
                marginLeft: 20,
                marginRight: 20,
              }}>
                <CardItem
                  image={item.image}
                  source={item.image.sizes.small.url}
                  title={item.name}
                  subtitle={item.category}
                  selected={!!innerItems.find((i) => i === item._id)}
                  badge={badge}
                  onPress={() => {
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
          numColumns={2}
          masonry
        />
      </SafeScrollView>
      <View style={{
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: 8,
      }}>
        <Button variant="primary"
          disabled={innerItems.length === 0}
          onPress={async () => {
            if (mode === 'new') {
              setItems(innerItems)

              dismissTo(ROUTES.MODALS.NEW_OUTFIT, {
                forwardRedirect: true,
                params: { itemIds: innerItems }
              });
              return;
            }

            await updateItems(innerItems);
            redirect({
              params: { itemIds: innerItems },
              fallbackTo: ['back', '/'],
              resetNextRoute: false
            });
          }}
        >
          Save Selection
        </Button>
      </View>
    </View>
  )
}