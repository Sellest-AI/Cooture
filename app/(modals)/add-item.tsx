import { Button } from "@ui/button";
import { CardItem } from "@ui/cards/card-item";
import { Search } from "@ui/icons";
import { MasonryList } from "@ui/masonry-list";
import { ModalHeader } from "@ui/modal";
import { SafeScrollView } from "@ui/safe-scroll-view";
import { TextInput } from "@ui/text-input";
import { Href, router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

export default function AddItemScreen() {
  const { nextPath } = useLocalSearchParams<{ nextPath?: string }>();

  return (
    <>
      <SafeScrollView
        style={{
          padding: 12,
          backgroundColor: Colors.blur.modal,
        }}
      >
        <ModalHeader
          title="Choose items"
          onBack={() => {
            if (router.canGoBack()) router.back()
            else router.replace(ROUTES.ITEM.ID('XXX'))
          }}
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
          data={[
            require('assets/placeholders/shoes-outfit.png'),
            require('assets/placeholders/jeans-outfit.png'),
            require('assets/placeholders/full-outfit.png'),
            require('assets/placeholders/full-outfit.png'),
            require('assets/placeholders/full-outfit.png'),
            require('assets/placeholders/full-outfit.png'),
            require('assets/placeholders/shoes-outfit.png'),
          ]}
          style={{ columnGap: 48, paddingHorizontal: 8, paddingBottom: 56 }}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, i }) => {
            return (
              <View style={{ marginBottom: 24, paddingTop: 3 }}>
                <CardItem
                  source={item as string}
                  title="Saved Item"
                  subtitle="Favorited"
                  selected={i % 3 === 0}
                  badge={i < 3 ? "New" : undefined}
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
          onPress={() => {
            if (nextPath) router.replace(nextPath as Href);
            else if (router.canGoBack()) router.back()
          }}
        >
          Save Selection
        </Button>
      </View>
    </>
  )
}