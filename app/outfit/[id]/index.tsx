import { useRoute, useRouter, useStateEffect } from "@/hooks";
import { api, Id } from "@/lib/convex/api";
import { useAccount } from "@/lib/convex/auth";
import { useQuery, useQueryCached } from "@/lib/convex/client";
import { SelectedItemModal } from "@/modules/items/selected-item.modal";
import { useOutfit } from "@/modules/outfits/_hooks/useOutfit";
import { PremiumBlock } from "@/modules/premium/premium-block";
import { Block } from "@ui/block";
import { LoadingBlock } from "@ui/block.loading";
import { Button } from "@ui/button";
import { ImageGeneration } from "@ui/cards";
import { CardItem } from "@ui/cards/card-item";
import { FlashList } from "@ui/flat-list";
import { ArrowRight, ArrowUpRight, Pencil, SquirishPlus, Trash } from "@ui/icons";
import { Image } from "@ui/image";
import { ModalHeader } from "@ui/modal";
import { ParallaxScrollView } from "@ui/parallax-scroll-view";
import { Pressable } from "@ui/pressable";
import { SafeAreaView, useSafeAreaInsets } from "@ui/safe-area-view";
import { Text } from "@ui/text";
import { TextInput } from "@ui/text-input";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Keyboard, View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

const UserBlock = () => {
  const { push } = useRouter('/outfit/[id]');
  const { id } = useRoute.Params<{ id: Id<'outfits'> }>();
  const { outfit } = useOutfit(id);

  const { data: user } = useQuery(api.router.users.getAccount.anon, outfit ? { userId: outfit.userId } : 'skip');

  if (!user) return null;

  return (
    <Pressable
      onPress={() => push(ROUTES.USER.PATH, { pathParams: { id: user._id } })}
    >
      <Block
        variant="blur"
        style={{
          borderRadius: 28,
          paddingHorizontal: 16,
          paddingVertical: 20,
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 10
        }}
      >
        <View style={{
          width: 32, height: 32,
          borderRadius: 99,
          borderColor: Colors.blur.medium,
          borderWidth: 1,
          backgroundColor: Colors.blur.dark,
          overflow: 'hidden'
        }}>
          <Image
            source={user.image}
            style={{ flex: 1 }}
          />
        </View>
        <View>
          <Text.Sm color={Colors.neutral[50]} weight={600}>{user.name}</Text.Sm>
          <Text.Sm color={Colors.neutral[400]} style={{ marginTop: 2 }}>@{user.username}</Text.Sm>
        </View>
        <ArrowUpRight
          style={{
            position: 'absolute',
            right: 20,
            bottom: 20,
          }}
          color={Colors.neutral[200]}
        />
      </Block>
    </Pressable>
  )
}

const Generation = ({ imageId, predictionId }: { imageId: Id<'images'>, predictionId: Id<'predictions'> }) => {
  const { push } = useRouter('/outfit/[id]');
  const { data: image } = useQueryCached(api.router.storage.images.getOne.anon, { id: imageId });

  return (
    <ImageGeneration
      source={image?.sizes.medium.url}
      onPresss={() => {
        push(ROUTES.POST.PATH, {
          pathParams: { id: predictionId }
        })
      }}
    />
  )
}

const Generations = () => {
  const { id } = useRoute.Params<{ id: Id<'outfits'> }>();
  const { outfit } = useOutfit(id);

  const { data: generations } = useQuery(api.router.feed.getFromOutfit.anon, outfit ? { outfitId: outfit._id } : 'skip');

  if (!outfit) return null;
  if (generations?.length === 0) return null;

  return (
    <>
      <Text.H3
        color={Colors.neutral[50]}
        style={{ textAlign: 'center', marginTop: 32 }}
      >
        Generations
      </Text.H3>
      <FlashList
        data={generations}
        style={{ marginTop: 20 }}
        renderItem={({ item, index }) => {
          const marginLeft = index % 2 === 0 ? 0 : 4;
          const marginRight = index % 2 === 0 ? 4 : 0;
          return (
            <View style={{ marginBottom: 8, marginLeft, marginRight }}>
              <Generation
                imageId={item.imageId}
                predictionId={item._id}
              />
            </View>
          )
        }}
        numColumns={2}
      />
      <Text.Base
        color={Colors.neutral[400]}
        style={{
          textAlign: 'center',
          maxWidth: 148,
          alignSelf: 'center',
          marginTop: 24,
          marginBottom: 24
        }}
      >
        No more previews available
      </Text.Base>
    </>
  )
}

export default function ItemScreen() {
  const { user: me } = useAccount();
  const { bottom } = useSafeAreaInsets();

  const { push } = useRouter('/outfit/[id]');
  const { id } = useRoute.Params<{ id: Id<'outfits'> }>();
  const { outfit, updateItems, updateName, remove } = useOutfit(id);
  const { data: user } = useQuery(api.router.users.getAccount.anon, outfit ? { userId: outfit.userId } : 'skip');
  const { data: generations } = useQuery(api.router.feed.getFromOutfit.anon, outfit ? { outfitId: outfit._id } : 'skip');

  const [selectedItem, setSelectedItem] = useState<Id<'items'> | null>(null);
  const [items, setItems] = useStateEffect(outfit?.items ?? []);
  const [name, setName] = useStateEffect(outfit?.name ?? '');

  const hasChanges = useMemo(() => {
    if (!outfit) return false;
    if (name !== outfit.name) return true;
    if (items.length !== outfit.items.length) return true;
    const outfitItemIds = outfit.items.map((i) => i._id).sort();
    const currentItemIds = items.map((i) => i._id).slice().sort();
    if (currentItemIds.some((id) => !outfitItemIds.includes(id))) return true;
    if (outfitItemIds.some((id) => !currentItemIds.includes(id))) return true;
    return false;
  }, [items, name, outfit])

  const exit = () => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace(ROUTES.PROFILE.OUTFITS)
    }
  }

  const ownOutfit = outfit?.userId === me?._id;

  if (!outfit) {
    return <LoadingBlock style={{ height: 'auto', flex: 1 }} />
  }

  return (
    <>
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.background
        }}
      >
        <ParallaxScrollView
          showsVerticalScrollIndicator={false}
          style={{
            // paddingTop: 12,
            // marginHorizontal: 12
          }}
          contentNegativeSpace={12}
          headerBackgroundImage={outfit.cover?.sizes.large.url}
          headerBackgroundImageStyle={{ opacity: 0.4 }}
          headerContent={
            <View style={{ height: 248, paddingTop: 12 }}>
              <ModalHeader
                type="alt"
                size="big"
                title={"Outfit"}
                subtitle={outfit.name}
                onBack={exit}
                style={{ paddingHorizontal: 12 }}
              />
              {user && <Pressable
                onPress={() => push(ROUTES.USER.PATH, { pathParams: { id: user._id } })}
                style={{
                  position: 'absolute',
                  bottom: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                }}>
                <View style={{
                  borderColor: Colors.blur.medium,
                  backgroundColor: Colors.blur.dark,
                  borderRadius: 99,
                  borderWidth: 1,
                  width: 36,
                  height: 36,
                  overflow: 'hidden',
                  marginBottom: 8
                }}>
                  <Image
                    source={user.image}
                    style={{ flex: 1 }}
                  />
                </View>
                <Text.Base color={Colors.neutral[200]} weight={600}>
                  Created by {user.name}
                </Text.Base>
              </Pressable>}
            </View>
          }
        >
          <SafeAreaView
            edges={{ top: 'off' }}
            style={{
              paddingHorizontal: 12,
              paddingBottom: hasChanges ? 72 : 12,
              // minHeight:
              //   Dimensions.get('window').height - 248 - 12,
            }}
          >
            <Button
              variant="primary"
              endIcon={ArrowRight}
              onPress={async () => {
                push(ROUTES.PHOTOSHOOT.NEW, {
                  params: { outfitId: outfit._id }
                })
              }}
            >
              Try on
            </Button>
            {ownOutfit && <TextInput
              style={{ marginTop: 12 }}
              startIcon={Pencil}
              placeholder="Name your outfit..."
              onChangeText={setName}
              value={name}
            />}
            <FlashList
              data={[...items, undefined]}
              style={{ marginTop: 36 }}
              keyExtractor={(i, index) => i?._id ?? `${index}`}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                if (!item) {
                  if (!ownOutfit) return null;
                  if ((generations ?? [])?.length > 0) return null;
                  return (
                    <SquirishPlus
                      style={{
                        marginBottom: 40,
                        paddingTop: 3,
                        marginLeft: 20,
                        marginRight: 20,
                      }}
                      size={112}
                      onPress={() => {
                        updateItems(items.map((i) => i._id));
                        push(ROUTES.MODALS.OUTFIT_ADD_ITEM, {
                          params: { outfitId: id }
                        })
                      }}
                    />)
                }

                return (
                  <View style={{
                    marginBottom: 40,
                    paddingTop: 3,
                    marginLeft: 20,
                    marginRight: 20,
                  }}
                  >
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
              masonry
            />
            <FlashList
              data={['user', 'premium', 'generations']}
              keyExtractor={(i) => i}
              renderItem={({ item }) => {
                if (item === 'user') return <UserBlock />
                if (item === 'premium') return <PremiumBlock style={{ marginTop: 12 }} />
                if (item === 'generations') return <Generations />
                return null;
              }}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
            {ownOutfit && <Button
              style={{ marginTop: 12 }}
              variant="destructive"
              startIcon={Trash}
              onLongPress={async () => {
                await remove();
                if (router.canGoBack()) router.back();
                else router.replace(ROUTES.PROFILE.OUTFITS);
              }}
            >
              Delete Outfit
            </Button>}
          </SafeAreaView>
        </ParallaxScrollView>
        {(ownOutfit && hasChanges) && <View style={{
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: bottom + 8,
        }}>
          <Button
            variant={'primary'}
            disabled={!hasChanges}
            onPress={async () => {
              Keyboard.dismiss();
              await updateItems(items.map((i) => i._id));
              await updateName(name);
            }}
          >
            Save Changes
          </Button>
        </View>}
      </View>
      <SelectedItemModal
        onRemove={items.length > 1 ? () => {
          setSelectedItem(null);
          setItems((p) => p.filter(x => x._id !== selectedItem))
        } : undefined}
        itemId={selectedItem}
        open={!!selectedItem}
        onOpenChange={() => setSelectedItem(null)}
      />
    </>
  )
}