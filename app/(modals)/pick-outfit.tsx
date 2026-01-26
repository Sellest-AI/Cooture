import { Button } from "@ui/button";
import { Collection } from "@ui/cards";
import { MasonryList } from "@ui/masonry-list";
import { ModalHeader } from "@ui/modal";
import { Href, router, useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

export default function PickOutfitScreen() {
  const { nextPath, canSkip: _canSkip } = useLocalSearchParams();
  const canSkip = Boolean(_canSkip);

  return (
    <>
      <ScrollView
        style={{
          padding: 12,
          backgroundColor: Colors.blur.modal,
        }}
      >
        <ModalHeader title="Pick an outfit" />
        <MasonryList
          key="0"
          data={[
            undefined,
            require('assets/placeholders/shoes-outfit.png'),
            require('assets/placeholders/jeans-outfit.png'),
            require('assets/placeholders/full-outfit.png'),
            require('assets/placeholders/jeans-outfit.png'),
            require('assets/placeholders/full-outfit.png'),
            require('assets/placeholders/shoes-outfit.png'),
          ]}
          style={{
            columnGap: 48,
            paddingHorizontal: 8,
            paddingBottom: canSkip ? 86 : 0,
          }}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, i }) => {
            if (!item) {
              return (<View style={{ marginBottom: 24, paddingTop: 3 }}>
                <Collection
                  title="New outfit"
                  onPress={() => {
                    router.push({
                      pathname: ROUTES.MODALS.NEW_OUTFIT,
                      params: { nextPath }
                    })
                  }}
                />
              </View>
              )
            }

            return (
              <View style={{ marginBottom: 24, paddingTop: 3 }}>
                <Collection
                  source={item as string}
                  contentFit="contain"
                  title="Saved Item"
                  subtitle="Favorited"
                  // selected={i % 3 === 0}
                  onPress={() => {
                    if (nextPath) {
                      router.replace(nextPath as Href)
                    } else if (router.canGoBack()) {
                      router.back()
                    } else {
                      router.replace(ROUTES.PROFILE.OUTFITS)
                    }
                  }}
                />
              </View>
            )
          }}
          numColumns={2}
        />
      </ScrollView>
      {(canSkip && nextPath) && <View style={{
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: 8,
      }}>
        <Button
          variant="blur"
          onPress={() => {
            if (nextPath)
              router.replace(nextPath as Href)
          }}>
          Skip
        </Button>
      </View>}
    </>
  )
}