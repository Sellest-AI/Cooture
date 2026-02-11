import { Router, useRoute, useRouter } from "@/hooks";
import { api, Id, useQueryCached } from "@/lib/convex/client";
import { SelectedItemModal } from "@/modules/items/selected-item.modal";
import { useOutfit } from "@/modules/outfits/_hooks/useOutfit";
import { KeyboardAvoiderView } from "@good-react-native/keyboard-avoider";
import { LoadingBlock } from "@ui/block.loading";
import { Button } from "@ui/button";
import { CardItem } from "@ui/cards/card-item";
import { Pencil, SquirishPlus } from "@ui/icons";
import { MasonryList } from "@ui/masonry-list";
import { ModalHeader } from "@ui/modal";
import { SafeScrollView } from "@ui/safe-scroll-view";
import { TextInput } from "@ui/text-input";
import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { ROUTES } from "routes";

export default function NewOutfitScreen() {
  const { reset, setItems, name, setName, items: itemIds, saveOutfit } = useOutfit.New();
  const { push, redirect } = useRouter("/new-outfit");
  useRoute("/new-outfit", {
    onInit: ({ itemIds }) => { setItems(itemIds ?? []) },
    resetFnc: reset,
  });

  const [selectedItem, setSelectedItem] = useState<Id<'items'> | null>(null);
  const { data: items } = useQueryCached(api.router.items.getMany.anon, { itemIds });

  if (itemIds.length === 0) {
    return <Router.Redirect
      href={ROUTES.MODALS.OUTFIT_ADD_ITEM}
      currentRoute="/new-outfit"
      forwardRedirect={true}
    />
  }

  return (
    <>
      <View style={{ flex: 1 }}>
        <SafeScrollView
          style={{
            padding: 12,
            // borderTopWidth: 2,
            // borderTopColor: Colors.blur.dark,
          }}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[0]}
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
                      push(ROUTES.MODALS.OUTFIT_ADD_ITEM, {
                        redirectHere: true
                      })
                    }}
                  />)
                }

                return (
                  <View style={{ marginBottom: 24, paddingTop: 3 }}>
                    <CardItem
                      source={item.image.sizes.small.url}
                      title={item.name}
                      subtitle={item.category}
                      onLongPress={() => setSelectedItem(item._id)}
                    />
                  </View>
                )
              }}
              numColumns={2}
            />
            : <LoadingBlock style={{ height: 500 }} />
          }
        </SafeScrollView>
        <KeyboardAvoiderView
          avoidMode="focused-input"
          style={{
            position: 'relative',
            paddingHorizontal: 12,
            paddingBottom: 12,
          }}>
          <TextInput
            startIcon={Pencil}
            placeholder="Name your outfit..."
            onChangeText={setName}
            value={name}
            style={{
              marginBottom: 12,
            }}
          />
          <Button
            variant="primary"
            onPress={async () => {
              const outfit = await saveOutfit();
              redirect({
                params: { outfitId: outfit },
                fallbackTo: ['back', ROUTES.OUTFIT.ID(outfit)]
              });
            }}
          >
            Save Outfit
          </Button>
        </KeyboardAvoiderView>
      </View>
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