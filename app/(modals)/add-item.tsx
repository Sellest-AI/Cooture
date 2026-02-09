import { ROUTES, useRouter, useStateEffect } from "@/hooks";
import { api, useQuery } from "@/lib/convex/client";
import { useOutfit } from "@/modules/outfits/_hooks/useOutfit";
import { Button } from "@ui/button";
import { CardItem } from "@ui/cards/card-item";
import { Search } from "@ui/icons";
import { MasonryList } from "@ui/masonry-list";
import { ModalHeader } from "@ui/modal";
import { SafeScrollView } from "@ui/safe-scroll-view";
import { TextInput } from "@ui/text-input";
import { normalizeArray } from "@utils/convex-allowed";
import { router } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { Colors } from "theme";

export default function AddItemScreen() {
  const { params, redirect, dismissTo } = useRouter("/add-item");
  const { outfitId, itemIds } = params;
  const { data: _items } = useQuery(api.router.items.getAll.authed);

  const mode = outfitId ? 'edit' : 'new';

  const { outfit, updateItems } = useOutfit(outfitId ?? null);
  const { setItems, items } = useOutfit.New();
  const [innerItems, setInnerItems] = useStateEffect(mode === 'edit' ? outfit?.items.map((i) => i._id) ?? [] : items);

  // Initialize items if itemIds are provided
  useEffect(() => { if (itemIds && itemIds.length > 0) setItems(normalizeArray(itemIds)) }, [itemIds, setItems])

  const newDelay = Date.now() - 3 * 24 * 60 * 60 * 1000 // 3 days

  return (
    <View style={{
      flex: 1,
      backgroundColor: Colors.blur.modal,
    }}>
      <SafeScrollView
        showsVerticalScrollIndicator={false}
        style={{
          padding: 12,
        }}
      >
        <ModalHeader
          title="Choose items"
          onBack={router.canGoBack() ? () => { router.back() } : undefined}
        />
        <TextInput
          startIcon={Search}
          placeholder="Search for items..."
          style={{
            marginBottom: 12,
          }}
        />
        <MasonryList
          key="0"
          data={_items ?? []}
          style={{ columnGap: 48, paddingHorizontal: 8, paddingBottom: 56 }}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => {
            return (
              <View style={{ marginBottom: 24, paddingTop: 3 }}>
                <CardItem
                  source={item.image.sizes.small.url}
                  title={item.name}
                  subtitle={item.category}
                  selected={!!innerItems.find((i) => i === item._id)}
                  badge={item._creationTime > newDelay ? "New" : undefined}
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
                redirectTo: redirect,
                params: { itemIds: innerItems }
              });
              return;
            }

            await updateItems(innerItems);
            if (redirect) dismissTo(redirect, { params: { itemIds: innerItems } });
            else if (router.canGoBack()) router.back()
          }}
        >
          Save Selection
        </Button>
      </View>
    </View>
  )
}