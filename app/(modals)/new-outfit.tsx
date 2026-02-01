import { useRouter } from "@/hooks";
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
import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

export default function NewOutfitScreen() {
  const { reset, setItems, name, setName, items: itemIds, saveOutfit } = useOutfit.New();
  const { redirect, push, dismissTo } = useRouter("/new-outfit", {
    onInit: ({ itemIds }) => { setItems(itemIds ?? []) },
    resetFnc: reset,
  });

  const [selectedItem, setSelectedItem] = useState<Id<'items'> | null>(null);
  const { data: items } = useQueryCached(api.router.items.getMany.anon, { itemIds });

  if (itemIds.length === 0) {
    return <useRouter.Redirect
      href={ROUTES.MODALS.OUTFIT_ADD_ITEM}
      redirectTo={redirect}
    />
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

                if (redirect) {
                  dismissTo(redirect, { params: { outfitId: outfit } });
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