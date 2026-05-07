import { Route, useRouter } from "@/hooks";
import { api, Doc, Id, useQuery, useQueryCachedData } from "@/lib/convex/client";
import { Block } from "@ui/block";
import { Button } from "@ui/button";
import { Collection } from "@ui/cards";
import { FlashList, FlashListRef } from "@ui/flat-list";
import { ArrowRight } from "@ui/icons";
import { Pressable } from "@ui/pressable";
import { Skeleton } from "@ui/skeleton";
import { Text } from "@ui/text";
import { notEmpty } from "@utils/convex-allowed";
import { MotiView } from "moti";
import { useRef, useState } from "react";
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
  showOnlyOwnedOutfits?: boolean;
}
export default function PickOutfitScreen({ header, showOnlyOwnedOutfits = false, canSkipText, preSelectedItemIds, preSelectedOutfitId, redirectTo, currentPath, onSelectOutfit }: Props) {
  const { push, redirect } = useRouter(currentPath);

  const { data: outfits } = useQueryCachedData(api.router.outfits.getAll.authed, { key: "getAllOutfits" });
  const filteredOutfits = outfits ? [
    outfits.find(o => o._id === preSelectedOutfitId),
    ...outfits.filter((outfit) => !outfit.items.some((item) => preSelectedItemIds?.includes(item.itemId)))
      .filter((o) => o._id !== preSelectedOutfitId)
  ].filter(notEmpty).filter((o) => !showOnlyOwnedOutfits || o.ownedByUser)
    : undefined;

  const [category, setCategory] = useState<string | null>(null);
  const { data: searchedOutfits } = useQuery(api.router.outfits.searchMany.anon, category ? { query: category } : 'skip');

  const finalOutfits = category ? searchedOutfits : filteredOutfits;

  type Data = NonNullable<typeof finalOutfits>[number] | string | undefined;
  const ref = useRef<FlashListRef<Data>>(null);

  return (
    <View style={{ flex: 1 }}>
      <FlashList
        ref={ref}
        style={{
          paddingBottom: 0,
        }}
        ListHeaderComponent={<>{header}</>}
        data={[...(!showOnlyOwnedOutfits ? ['header', undefined] : [undefined]), ...(finalOutfits ?? ['loading', 'loading', 'loading'])]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 24 + (canSkipText ? 64 : 0) + (preSelectedOutfitId ? 64 : 0)
        }}
        overrideItemLayout={(layout, item) => { if (item === 'header') layout.span = 2 }}
        stickyHeaderIndices={showOnlyOwnedOutfits ? undefined : [0]}
        stickyHeaderHiddenOnScroll={true}
        stickyHeaderConfig={{
          useNativeDriver: true,
          hideRelatedCell: true,
          offset: 8
        }}
        renderItem={({ item, index }) => {
          if (typeof item === 'string') {
            if (item === 'header') return (<FlashList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                minHeight: 34,
                paddingHorizontal: 12,
                marginBottom: 24
              }}
              data={['Gorpcore', 'Y2K', 'Dark Academia', 'Coquette', 'Romcom Core', 'Tech-Romance', 'Minimalist', 'Old Money', 'Parisian Chic', 'Streetwear', 'Boho Chic', 'Grunge', 'Opium', 'Corporatecore', 'Blokecore', 'Eclectic Grandpa', 'Western Gothic', 'Mob Wife Aesthetic', 'Retro-Futurism']}
              keyExtractor={(item) => item}
              renderItem={({ item, index }) => (
                <Pressable
                  onPress={() => {
                    setCategory((c) => c === item ? null : item);
                    ref.current?.scrollToTop({ animated: true });
                  }}
                >
                  <Block
                    // blurKey={BlurKeys.PHOOTSHOOT_PRESETS_ITEMS}
                    variant={category === item ? 'primary' : 'blur'}
                    style={{
                      padding: 8,
                      paddingHorizontal: 16,
                      // Categories length
                      marginRight: (19) - 1 === index ? 0 : 8,
                      borderRadius: 99,
                    }}
                  >
                    <Text.Base weight={500} color={category === item ? Colors.primary[900] : Colors.neutral[200]}>
                      {item}
                    </Text.Base>
                  </Block>
                </Pressable>
              )}
            />)
            if (item === 'loading') return (
              <View style={{
                marginBottom: 24,
                paddingTop: 3,
                marginLeft: 24,
                marginRight: 24,
                alignItems: 'center'
              }}>
                <Skeleton
                  style={{
                    aspectRatio: 4 / 5,
                    width: '100%',
                    borderRadius: 12,
                  }}
                />
                <Skeleton
                  style={{
                    height: 12,
                    width: '50%',
                    borderRadius: 99,
                    marginTop: 8,
                  }}
                />
              </View>
            )
          }

          const outfit = item;

          if (!outfit) {
            return (<View style={{
              marginBottom: 24,
              paddingTop: 3,
              marginLeft: 24,
              marginRight: 24,
            }}>
              <Collection
                title="New outfit"
                onPress={() => {
                  push(ROUTES.OUTFIT.NEW, {
                    params: { itemIds: preSelectedItemIds },
                    forwardRedirect: true,
                    redirectTo: redirectTo,
                    resetNextRoute: true
                  })
                }}
              />
            </View>
            )
          }

          if (typeof outfit === 'string') return null;

          const ownedByUser = "ownedByUser" in outfit ? outfit.ownedByUser : false;
          const subtitle = ownedByUser ? `${outfit.itemsCount} items` : 'Trending';

          if (showOnlyOwnedOutfits && !ownedByUser) return null;

          return (
            <View style={{
              marginBottom: 24,
              paddingTop: 3,
              marginLeft: 24,
              marginRight: 24,
            }}
            >
              <Collection
                style={{
                  subtitleColor: ownedByUser ? undefined : Colors.secondary[500],
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