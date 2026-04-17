import { Router, useRoute, useRouter } from "@/hooks";
import { api, useQueryCached } from "@/lib/convex/client";
import { useOutfit } from "@/modules/outfits/_hooks/useOutfit";
import { KeyboardAvoiderView } from "@good-react-native/keyboard-avoider";
import { LoadingBlock } from "@ui/block.loading";
import { Button } from "@ui/button";
import { CardItem } from "@ui/cards/card-item";
import { FlashList } from "@ui/flat-list";
import { Pencil, SquirishPlus } from "@ui/icons";
import { ModalHeader } from "@ui/modal";
import { SafeAreaView } from "@ui/safe-area-view";
import { TextInput } from "@ui/text-input";
import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { ROUTES } from "routes";

export default function NewOutfitScreen() {
  const [init, setInit] = useState(false);
  const { reset, setItems, name, setName, items: itemIds, saveOutfit } = useOutfit.New();
  const { dismissTo, redirect } = useRouter("/new-outfit");
  const { redirectTo } = useRoute("/new-outfit", {
    onInit: ({ itemIds }) => { setItems(itemIds ?? []); setInit(true); },
    resetFnc: reset,
  });

  const { push } = useRouter();
  const { data: items } = useQueryCached(api.router.items.getMany.anon, { itemIds });

  if (itemIds.length === 0 && init) {
    return <Router.Redirect
      href={ROUTES.OUTFIT.NEW}
      currentRoute="/new-outfit"
      forwardRedirect={true}
    />
  }

  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
        <FlashList
          data={[...(items ?? []), undefined]}
          contentContainerStyle={{ paddingTop: 16, paddingHorizontal: 12 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<LoadingBlock style={{ height: 500 }} />}
          ListHeaderComponent={
            <ModalHeader
              title="Create an outfit"
              onBack={router.canGoBack() ? () => { router.back() } : undefined}
            />
          }
          renderItem={({ item, index }) => {
            const marginLeft = 20;
            const marginRight = 20;

            if (!item) {
              return (<SquirishPlus
                style={{
                  marginBottom: 24,
                  paddingTop: 3,
                  marginLeft,
                  marginRight,
                }}
                size={112}
                onPress={() => {
                  dismissTo(ROUTES.OUTFIT.NEW, {
                    forwardRedirect: true,
                    resetNextRoute: false,
                    params: { itemIds }
                  })
                }}
              />)
            }

            return (
              <View style={{ marginBottom: 24, paddingTop: 3, marginLeft, marginRight }}>
                <CardItem
                  image={item.image}
                  source={item.image.sizes.small.url}
                  title={item.name}
                  subtitle={item.category}
                  onLongPress={() => {
                    push(ROUTES.MODALS.PREVIEW_ITEM, {
                      forwardRedirect: false,
                      params: {
                        itemId: item._id,
                        onRemove: () => {
                          setItems((p) => p.filter(x => x !== item._id));
                          router.back();
                        }
                      }
                    })
                  }}
                />
              </View>
            )
          }}
          numColumns={2}
          masonry
          ListFooterComponent={<>
            <View style={{ height: 132 }} />
          </>}
        />
        <View
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            paddingBottom: 12,
            paddingHorizontal: 4,
            width: '100%',
          }}>
          <KeyboardAvoiderView
            avoidMode="whole-view"
            style={{ marginBottom: 12 }}
            extraSpace={112}
          >
            <TextInput
              startIcon={Pencil}
              placeholder="Name your outfit (optional)"
              onChangeText={setName}
              value={name}
            />
          </KeyboardAvoiderView>
          <Button
            variant="primary"
            disabled={itemIds.length < 2}
            onPress={async () => {
              const outfit = await saveOutfit();

              if (redirectTo === ROUTES.OUTFIT.PATH) {
                redirect({
                  pathParams: { id: outfit },
                  fallbackTo: ['back', ROUTES.OUTFIT.ID(outfit)],
                  resetNextRoute: true
                })

                return;
              }

              redirect({
                params: { outfitId: outfit },
                fallbackTo: ['back', ROUTES.OUTFIT.ID(outfit)],
                resetNextRoute: false
              });
            }}
          >
            Save Outfit
          </Button>
        </View>
      </SafeAreaView>
    </>
  )
}