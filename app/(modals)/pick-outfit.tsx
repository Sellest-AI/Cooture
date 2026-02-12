import { Router, useRoute, useRouter } from "@/hooks";
import { api, useMutation, useQueryCached } from "@/lib/convex/client";
import { LoadingBlock } from "@ui/block.loading";
import { Button } from "@ui/button";
import { Collection } from "@ui/cards";
import { FlashList } from "@ui/flat-list";
import { ModalHeader } from "@ui/modal";
import { ScrollView, View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

export default function PickOutfitScreen() {
  const { mutate: update } = useMutation(api.router.outfits.editOne.authed);
  const { push, redirect } = useRouter("/pick-outfit");
  const { canSkip, itemIds, redirectTo } = useRoute("/pick-outfit");

  const { data: outfits } = useQueryCached(api.router.outfits.getAll.authed);
  const filteredOutfits = outfits?.filter((outfit) => !outfit.items.some((item) => itemIds?.includes(item.itemId)));

  // Redirect to new outfit if no outfits available
  if (filteredOutfits && filteredOutfits.length === 0) {
    return <Router.Redirect
      redirectTo={redirectTo}
      href={ROUTES.MODALS.NEW_OUTFIT}
      params={{ itemIds }}
    />
  }

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          padding: 12,
          backgroundColor: Colors.blur.modal,
        }}
      >
        <ModalHeader title="Pick an outfit" />
        {filteredOutfits ? <FlashList
          data={[
            undefined,
            ...filteredOutfits,
          ]}
          style={{
            paddingHorizontal: 8,
            paddingBottom: canSkip ? 86 : 24,
          }}
          renderItem={({ item: outfit, index }) => {
            if (!outfit) {
              return (<View style={{
                marginBottom: 24,
                paddingTop: 3,
                marginLeft: index % 2 === 0 ? 8 : 24,
                marginRight: index % 2 === 0 ? 24 : 8,
              }}>
                <Collection
                  title="New outfit"
                  onPress={() => {
                    push(ROUTES.MODALS.NEW_OUTFIT, {
                      params: { itemIds },
                      forwardRedirect: true,
                    })
                  }}
                />
              </View>
              )
            }

            return (
              <View style={{
                marginBottom: 24,
                paddingTop: 3,
                marginLeft: index % 2 === 0 ? 8 : 24,
                marginRight: index % 2 === 0 ? 24 : 8,
              }}
              >
                <Collection
                  backgroundColor={outfit.backgroundColor}
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

                    redirect({
                      params: { outfitId: outfit._id },
                      fallbackTo: ['back', ROUTES.PROFILE.OUTFITS]
                    });
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
      {(canSkip && redirectTo) && <View style={{
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: 8,
      }}>
        <Button
          variant="blur"
          onPress={() => {
            redirect({ params: { outfitId: undefined } });
          }}>
          Skip
        </Button>
      </View>}
    </>
  )
}