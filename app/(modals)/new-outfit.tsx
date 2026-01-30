import { api, Id, useQueryCached } from "@/lib/convex/client";
import { SelectedItemModal } from "@/modules/items/selected-item.modal";
import { useOutfit } from "@/modules/outfits/_hooks/useOutfit";
import { Button } from "@ui/button";
import { CardItem } from "@ui/cards/card-item";
import { Pencil, SquirishPlus } from "@ui/icons";
import { LoadingBlock } from "@ui/loadingBlock";
import { MasonryList } from "@ui/masonry-list";
import { ModalHeader } from "@ui/modal";
import { SafeScrollView } from "@ui/safe-scroll-view";
import { TextInput } from "@ui/text-input";
import { normalizeArray } from "@utils/convex-allowed";
import { url } from "@utils/routes";
import { Href, Redirect, router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

export default function NewOutfitScreen() {
  const [selectedItem, setSelectedItem] = useState<Id<'items'> | null>(null);
  const { nextPath, itemIds: _itemIds, reset: _reset } = useLocalSearchParams<{ nextPath?: string, itemIds?: Id<'items'>[], reset?: string }>();
  const reset = Boolean(_reset);
  const itemsParam = useMemo(() => normalizeArray(_itemIds), [_itemIds]);

  const { name, setName, items: itemIds, setItems, saveOutfit, reset: resetParams } = useOutfit.New();
  const { data: items } = useQueryCached(api.router.items.getMany.anon, { itemIds });

  useEffect(() => { if (reset) resetParams() }, [reset, resetParams]);
  useEffect(() => { if (itemsParam.length > 0) { setItems(itemsParam); } }, [itemsParam, setItems]);

  if (itemIds.length === 0) {
    return <>
      <LoadingBlock />
      <Redirect
        href={ROUTES.MODALS.OUTFIT_ADD_ITEM({
          itemIds: itemsParam,
          nextPath: ROUTES.MODALS.NEW_OUTFIT({ nextPath })
        })}
      />
    </>;
  }

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={{ flex: 1, backgroundColor: Colors.blur.modal }}>
          <SafeScrollView
            style={{
              padding: 12,
              paddingBottom: 172,
              // borderTopWidth: 2,
              // borderTopColor: Colors.blur.dark,
              backgroundColor: Colors.blur.modal,
            }}
          >
            <ModalHeader
              title="Create an outfit"
              onBack={router.canGoBack() ? () => { router.back() } : undefined}
            />
            {items ?
              <MasonryList
                key="0"
                data={[...items, undefined]}
                style={{ columnGap: 48, paddingHorizontal: 8 }}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }) => {
                  if (!item) {
                    return (<SquirishPlus
                      style={{ marginBottom: 24, paddingTop: 3, }}
                      size={112}
                      onPress={() => {
                        router.push(ROUTES.MODALS.OUTFIT_ADD_ITEM({}))
                      }}
                    />)
                  }

                  return (
                    <View style={{ marginBottom: 24, paddingTop: 3 }}>
                      <CardItem
                        source={item.image.sizes.small.url}
                        title={item.name}
                        subtitle={item.category}
                        onPress={() => setSelectedItem(item._id)}
                      />
                    </View>
                  )
                }}
                numColumns={2}
              />
              : <LoadingBlock style={{ height: 500 }} />
            }
          </SafeScrollView>

          <View style={{
            position: 'absolute',
            left: 12,
            right: 12,
            bottom: 12,
          }}>
            <TextInput
              startIcon={Pencil}
              placeholder="Name your outfit..."
              onChangeText={setName}
              value={name}
              style={{
                marginBottom: 12,
                marginTop: 8
              }}
            />
            <Button
              variant="primary"
              onPress={async () => {
                const outfit = await saveOutfit();

                if (nextPath) {
                  router.replace(url(nextPath, { outfitId: outfit }) as Href)
                } else if (router.canGoBack()) {
                  router.back()
                } else {
                  router.replace(ROUTES.OUTFIT.ID(outfit))
                }
              }}
            >
              Save Outfit
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
      <SelectedItemModal
        onRemove={() => {
          setSelectedItem(null);
          setItems((p) => p.filter(id => id !== selectedItem))
        }}
        itemId={selectedItem}
        open={!!selectedItem}
        onOpenChange={() => setSelectedItem(null)}
      />
    </>
  )
}