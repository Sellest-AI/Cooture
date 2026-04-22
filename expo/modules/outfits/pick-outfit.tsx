import { Route, Router, useRouter } from "@/hooks";
import { api, Doc, Id, useQueryCachedData } from "@/lib/convex/client";
import { LoadingBlock } from "@ui/block.loading";
import { Button } from "@ui/button";
import { Collection } from "@ui/cards";
import { FlashList } from "@ui/flat-list";
import { ArrowRight } from "@ui/icons";
import { notEmpty } from "@utils/convex-allowed";
import { MotiView } from "moti";
import { View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

type Props = {
  /** Navigation */
  redirectTo?: Route;
  currentPath: Route;
  /** UI */
  header?: React.ReactNode;
  canSkipText?: string;
  /** Data */
  preSelectedItemIds?: Id<"items">[];
  preSelectedOutfitId?: Id<"outfits">;
  onSelectOutfit?: (outfit: Doc<'outfits'> & { itemIds: Id<"items">[] }) => void;
}
export default function PickOutfitScreen({ header, canSkipText, preSelectedItemIds, preSelectedOutfitId, redirectTo, currentPath, onSelectOutfit }: Props) {
  const { push, redirect } = useRouter(currentPath);

  const { data: outfits, isLoading } = useQueryCachedData(api.router.outfits.getAll.authed, { key: "getAllOutfits" });
  const filteredOutfits = outfits ? [
    outfits.find(o => o._id === preSelectedOutfitId),
    ...outfits.filter((outfit) => !outfit.items.some((item) => preSelectedItemIds?.includes(item.itemId)))
      .filter((o) => o._id !== preSelectedOutfitId)
  ].filter(notEmpty) : undefined;

  // Redirect to new outfit if no outfits available (but only after data is loaded)
  if (!isLoading && filteredOutfits && filteredOutfits.length === 0) {
    return <Router.Redirect
      redirectTo={redirectTo}
      href={ROUTES.MODALS.NEW_OUTFIT}
      params={{ itemIds: preSelectedItemIds }}
    />
  }

  return (
    <View style={{ flex: 1 }}>
      <FlashList
        style={{
          padding: 12,
          paddingBottom: 0,
        }}
        ListHeaderComponent={<>{header}</>}
        ListEmptyComponent={<><LoadingBlock /></>}
        data={filteredOutfits ? [undefined, ...filteredOutfits] : undefined}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 8,
          paddingBottom: 24 + (canSkipText ? 64 : 0) + (preSelectedOutfitId ? 64 : 0)
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
                  push(ROUTES.OUTFIT.NEW, {
                    params: { itemIds: preSelectedItemIds },
                    forwardRedirect: true,
                    resetNextRoute: true
                  })
                }}
              />
            </View>
            )
          }

          const subtitle = outfit.ownedByUser ? `${outfit.itemsCount} items` : 'Trending';

          return (
            <View style={{
              marginBottom: 24,
              paddingTop: 3,
              marginLeft: index % 2 === 0 ? 8 : 24,
              marginRight: index % 2 === 0 ? 24 : 8,
            }}
            >
              <Collection
                style={{
                  subtitleColor: outfit.ownedByUser ? undefined : Colors.secondary[500],
                }}
                selected={preSelectedOutfitId === outfit._id}
                backgroundColor={outfit.backgroundColor}
                source={outfit.cover.sizes.small.url}
                contentFit="contain"
                title={outfit.name}
                subtitle={subtitle}
                // selected={i % 3 === 0}
                onPress={() => {
                  onSelectOutfit?.({
                    ...outfit,
                    itemIds: outfit.items.map(i => i.itemId)
                  })

                  redirect({
                    params: { outfitId: outfit._id },
                    fallbackTo: redirectTo ?? ['back', ROUTES.PROFILE.OUTFITS],
                    resetNextRoute: false
                  });
                }}
              />
            </View>
          )
        }}
        numColumns={2}
      />
      <MotiView
        from={{
          opacity: 0,
          translateY: (preSelectedOutfitId ? 20 : 0) + (canSkipText ? 20 : 0)
        }}
        animate={{ opacity: 1, translateY: 0 }}
        delay={200}
        style={{
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: 12,
          alignItems: 'center',
          gap: 8
        }}>
        {preSelectedOutfitId && <Button
          variant="primary"
          endIcon={ArrowRight}
          onPress={() => {
            redirect({
              fallbackTo: redirectTo,
              params: { outfitId: preSelectedOutfitId },
              resetNextRoute: false
            });
          }}>
          Continue
        </Button>}
        {canSkipText && (
          <Button
            variant="blur"
            onPress={() => {
              redirect({
                fallbackTo: redirectTo,
                params: { outfitId: null },
                resetNextRoute: false
              });
            }}
          >
            {canSkipText}
          </Button>
        )}
      </MotiView>
    </View>
  )
}