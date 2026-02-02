import { useRouter } from "@/hooks";
import { api, useMutation, useQueryCached } from "@/lib/convex/client";
import { LoadingBlock } from "@ui/block.loading";
import { Button } from "@ui/button";
import { Collection } from "@ui/cards";
import { MasonryList } from "@ui/masonry-list";
import { ModalHeader } from "@ui/modal";
import { router } from "expo-router";
import { ScrollView, View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

export default function PickOutfitScreen() {
  const { mutate: update } = useMutation(api.router.outfits.editOne.authed);
  const { params, push, dismissTo, redirect } = useRouter("/pick-outfit");
  const { canSkip, itemIds } = params;

  const { data: outfits } = useQueryCached(api.router.outfits.getAll.authed);
  const filteredOutfits = outfits?.filter((outfit) => !outfit.items.some((item) => itemIds?.includes(item.itemId)));

  // Redirect to new outfit if no outfits available
  if (filteredOutfits && filteredOutfits.length === 0) {
    return <useRouter.Redirect
      href={ROUTES.MODALS.NEW_OUTFIT}
      params={{ itemIds }}
      redirectTo={redirect}
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
          renderItem={({ item: outfit }) => {
            if (!outfit) {
              return (<View style={{ marginBottom: 24, paddingTop: 3 }}>
                <Collection
                  title="New outfit"
                  onPress={() => {
                    push(ROUTES.MODALS.NEW_OUTFIT, {
                      params: { itemIds },
                      redirectTo: redirect,
                    })
                  }}
                />
              </View>
              )
            }

            return (
              <View style={{ marginBottom: 24, paddingTop: 3 }}>
                <Collection
                  source={outfit.cover.sizes.small.url}
                  contentFit="contain"
                  title={outfit.name}
                  subtitle={`${outfit.itemsCount} items`}
                  // selected={i % 3 === 0}
                  onPress={() => {
                    if (itemIds && itemIds?.length > 0) {
                      const items = Array.from(new Set([...outfit.items.map((i) => i.itemId), ...itemIds]));
                      update({ outfitId: outfit._id, items });
                    }

                    if (redirect) {
                      dismissTo(redirect, { params: { outfitId: outfit._id } });
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
      {(canSkip && redirect) && <View style={{
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: 8,
      }}>
        <Button
          variant="blur"
          onPress={() => {
            dismissTo(redirect, { params: { outfitId: undefined } });
          }}>
          Skip
        </Button>
      </View>}
    </>
  )
}