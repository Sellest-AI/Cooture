import { SelectedItemModal } from "@/modules/items/selected-item.modal";
import { Button } from "@ui/button";
import { CardItem } from "@ui/cards/card-item";
import { Pencil, SquirishPlus } from "@ui/icons";
import { MasonryList } from "@ui/masonry-list";
import { ModalHeader } from "@ui/modal";
import { SafeScrollView } from "@ui/safe-scroll-view";
import { TextInput } from "@ui/text-input";
import { Href, Redirect, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

export default function NewOutfitScreen() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const { nextPath } = useLocalSearchParams<{ nextPath?: string }>();

  const itemsLength = 0;
  if (itemsLength === 0) {
    return <Redirect
      href={`${ROUTES.MODALS.OUTFIT_ADD_ITEM}?nextPath=${ROUTES.MODALS.NEW_OUTFIT}`}
    />;
  }

  return (
    <>
      <SafeScrollView
        style={{
          padding: 12,
          // borderTopWidth: 2,
          // borderTopColor: Colors.blur.dark,
          backgroundColor: Colors.blur.modal,
        }}
      >
        <ModalHeader
          title="Create an outfit"
          onBack={() => {
            if (router.canGoBack()) router.back()
            else router.replace(ROUTES.ITEM.ID('XXX'))
          }}
        />
        <MasonryList
          key="0"
          data={[
            require('assets/placeholders/shoes-outfit.png'),
            require('assets/placeholders/blue-shirt.png'),
            require('assets/placeholders/jeans-outfit.png'),
            undefined,
          ]}
          style={{ columnGap: 48, paddingHorizontal: 8 }}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, i }) => {
            if (!item) {
              return (<SquirishPlus
                style={{ marginBottom: 24, paddingTop: 3, }}
                size={112}
                onPress={() => {
                  router.push(ROUTES.MODALS.OUTFIT_ADD_ITEM)
                }}
              />)
            }

            return (
              <View style={{ marginBottom: 24, paddingTop: 3 }}>
                <CardItem
                  source={item as string}
                  title="Saved Item"
                  subtitle="Favorited"
                  selected={i % 3 === 0}
                  badge={i < 3 ? "New" : undefined}
                  onPress={() => setSelectedItem('XXX')}
                />
              </View>
            )
          }}
          numColumns={2}
        />
        <TextInput
          startIcon={Pencil}
          placeholder="Name your outfit..."
          style={{
            marginBottom: 12,
            marginTop: 8
          }}
        />
        <Button
          variant="primary"
          onPress={() => {
            if (nextPath) {
              router.replace(nextPath as Href)
            } else if (router.canGoBack()) {
              router.back()
            } else {
              router.replace(ROUTES.PROFILE.OUTFITS)
            }
          }}
        >
          Save Outfit
        </Button>
      </SafeScrollView>
      <SelectedItemModal
        open={!!selectedItem}
        onOpenChange={() => setSelectedItem(null)}
      />
    </>
  )
}