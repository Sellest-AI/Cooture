import { api, useQueryCached } from "@/lib/convex/client";
import { Button } from "@ui/button";
import { Collection } from "@ui/cards";
import { LoadingBlock } from "@ui/loadingBlock";
import { MasonryList } from "@ui/masonry-list";
import { ModalHeader } from "@ui/modal";
import { normalizeArray } from "@utils/convex-allowed";
import { url } from "@utils/routes";
import { Href, Redirect, router, useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

export default function PickOutfitScreen() {
  const { nextPath, canSkip: _canSkip, itemIds: _itemIds } =
    useLocalSearchParams<{ nextPath?: string, canSkip?: string, itemIds?: string[] }>();
  const canSkip = Boolean(_canSkip);
  const itemIds = normalizeArray(_itemIds);

  const { data: outfits } = useQueryCached(api.router.outfits.getAll.authed);

  const filteredOutfits = outfits?.filter((outfit) => !outfit.items.some((item) => itemIds.includes(item.itemId)));

  // Redirect to new outfit if no outfits available
  if (filteredOutfits && filteredOutfits.length === 0) {
    return <Redirect
      href={ROUTES.MODALS.NEW_OUTFIT({ itemIds, nextPath, reset: true })}
    />
  }

  return (
    <>
      <ScrollView
        style={{
          padding: 12,
          backgroundColor: Colors.blur.modal,
        }}
      >
        <ModalHeader title="Pick an outfit" />
        {filteredOutfits ? <MasonryList
          key="0"
          data={[
            undefined,
            ...filteredOutfits,
          ]}
          style={{
            columnGap: 48,
            paddingHorizontal: 8,
            paddingBottom: canSkip ? 86 : 0,
          }}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => {
            if (!item) {
              return (<View style={{ marginBottom: 24, paddingTop: 3 }}>
                <Collection
                  title="New outfit"
                  onPress={() => {
                    router.push(ROUTES.MODALS.NEW_OUTFIT({ itemIds, nextPath, reset: true }))
                  }}
                />
              </View>
              )
            }

            return (
              <View style={{ marginBottom: 24, paddingTop: 3 }}>
                <Collection
                  source={item.cover.sizes.small.url}
                  contentFit="contain"
                  title={item.name}
                  subtitle={`${item.itemsCount} items`}
                  // selected={i % 3 === 0}
                  onPress={() => {
                    if (nextPath) {
                      router.replace(url(nextPath, { outfitId: item._id }) as Href)
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
        /> :
          <LoadingBlock />
        }
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