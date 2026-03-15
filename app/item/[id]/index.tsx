import { useRoute, useRouter } from "@/hooks";
import { api, Id } from "@/lib/convex/api";
import { useAccount } from "@/lib/convex/auth";
import { useMutation } from "@/lib/convex/client";
import { useItem } from "@/modules/items/_hooks/useItem";
import { ColorCategory } from "@/modules/items/category.color";
import { FeelCategory } from "@/modules/items/category.feel";
import { GenderCategory } from "@/modules/items/category.gender";
import { ItemCategory } from "@/modules/items/category.item";
import { WeatherCategory } from "@/modules/items/category.weather";
import { Block } from "@ui/block";
import { LoadingBlock } from "@ui/block.loading";
import { Button, BUTTON_HEIGHT } from "@ui/button";
import { ExternalLink, LinkIcon } from "@ui/icons";
import { Image } from "@ui/image";
import { ModalHeader } from "@ui/modal";
import { ParallaxScrollView } from "@ui/parallax-scroll-view";
import { SafeAreaView } from "@ui/safe-area-view";
import { Text } from "@ui/text";
import * as Linking from 'expo-linking';
import { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

const ColorsBlock = () => {
  const { item } = useItem();

  if (!item) return null;

  return (
    <Block
      variant="blur"
      style={{
        borderRadius: 32,
        paddingHorizontal: 16,
        paddingVertical: 20,
        gap: 12
      }}
    >
      <Text.H4 color={Colors.neutral[50]}>
        Colors
      </Text.H4>
      <View style={{ height: 72, flexDirection: 'row', gap: 4 }}>
        {item.mainColors.slice(0, 4).map((color, i) => (
          <View
            key={color + i}
            style={{
              flex: 1,
              borderRadius: 24,
              backgroundColor: color,
              borderTopColor: Colors.blur.light,
              borderTopWidth: 2,
            }}
          />
        ))}
      </View>
    </Block>
  )
}

const DeleteOutfitButton = () => {
  const [disabled, setDisabled] = useState(false);

  const { user } = useAccount();
  const { item } = useItem();

  const { dismissTo } = useRouter('/item/[id]');
  const { mutate } = useMutation(api.router.items.deleteOne.authed);

  if (!item || item.userId !== user?._id) return null;

  return (
    <Button
      variant="destructive"
      disabled={disabled}
      onLongPress={async () => {
        const { success } = await mutate({ itemId: item._id });
        if (success) dismissTo(ROUTES.PROFILE.ITEMS);
        else setDisabled(true);
      }}
    >
      Long press to delete
    </Button>
  )
}

const LinkBlock = () => {
  const { id } = useRoute.Params<{ id: Id<'items'> }>();
  const { item } = useItem(id);
  const { user } = useAccount();

  const isOwner = item?.userId === user?._id;

  const [canOpen, setCanOpen] = useState(true);
  useEffect(() => {
    (async () => {
      if (!item?.link) return setCanOpen(false);
      const canOpen = await Linking.canOpenURL(item.link);
      setCanOpen(canOpen);
    })();
  }, [item?.link])

  if (isOwner) return (
    <Block
      variant="blur"
      style={{
        borderRadius: 32,
        paddingHorizontal: 16,
        paddingVertical: 20,
        gap: 12
      }}
    >
      <Text.H4 color={Colors.neutral[50]}>
        Website link
      </Text.H4>
      <Text.Base color={Colors.neutral[200]}>
        Extract more information such as materials, price, sizes, higher quality images, etc…
      </Text.Base>
      {canOpen && <Button
        variant="blur"
        startIcon={ExternalLink}
        onPress={() => { if (item?.link) Linking.openURL(item.link); }}
      >
        Open website
      </Button>}
      <Button
        variant="blur"
        startIcon={LinkIcon}
      >
        Add link
      </Button>
    </Block>
  )

  if (canOpen) return (
    <Button
      variant="blur"
      startIcon={ExternalLink}
      onPress={() => { if (item?.link) Linking.openURL(item.link); }}
    >
      Open website
    </Button>
  )
}

export default function ItemScreen() {
  const { id } = useRoute.Params<{ id: Id<'items'> }>();
  const { push, redirect } = useRouter('/item/[id]');
  const { item, isLoading, update } = useItem(id);

  if (isLoading || !item) {
    return <LoadingBlock style={{ height: 'auto' }} />
  }

  return (
    <>
      <ParallaxScrollView
        headerBackground={
          <Image
            allowDownscaling={false}
            contentFit="cover"
            blurRadius={100}
            source={item.image?.sizes.thumbnail.url}
            style={{ width: '100%', height: '100%', opacity: 0.2 }}
          />
        }
        headerContent={
          <View>
            <ModalHeader
              style={{ paddingTop: 12, paddingHorizontal: 12 }}
              title={item.name}
              onBack={() => redirect({ fallbackTo: ['back', ROUTES.PROFILE.ITEMS] })}
            />
            <View style={{
              padding: 32,
              paddingBottom: Platform.OS === 'web' ? 32 : 16,
              flex: 1,
            }}>
              <Image
                priority="high"
                allowDownscaling={false}
                contentFit="contain"
                source={item.image?.sizes.medium.url}
                placeholder={item.image?.sizes.thumbnail.url}
                placeholderContentFit="contain"
                style={{
                  width: '100%',
                  height: 320,
                }}
              />
            </View>
            {item.description && <View style={{ paddingHorizontal: 32, marginTop: 16, marginBottom: 12 }}>
              <Text.Base color={Colors.neutral[200]} numberOfLines={4} style={{ textAlign: 'center' }}>
                {item.description}
              </Text.Base>
            </View>}
          </View>
        }
      >
        <SafeAreaView
          edges={{ top: 'off' }}
          style={{ padding: 8, gap: 8, marginBottom: BUTTON_HEIGHT + 8 }}
        >
          <LinkBlock />
          <ColorsBlock />
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
            <ItemCategory title={item.category} onPress={(category) => update({ category })} />
            <WeatherCategory title={item.weatherTags[0]} onPress={(weather) => update({ weatherTags: [weather, ...item.weatherTags.slice(1)] })} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
            <ColorCategory title={item.colorTones[0]} onPress={(color) => update({ colorTones: [color, ...item.colorTones.slice(1)] })} />
            <FeelCategory title={item.materialFeel} onPress={(materialFeel) => update({ materialFeel })} />
            <GenderCategory title={item.gender} onPress={(gender) => update({ gender })} />
          </View>
          <DeleteOutfitButton />
        </SafeAreaView>
      </ParallaxScrollView>
      <SafeAreaView style={{
        position: 'absolute',
        bottom: 0,
        left: 8,
        right: 8,
      }}>
        <Button
          variant="primary"
          onPress={() => {
            push(ROUTES.MODALS.PICK_OUTFIT, {
              redirectTo: ROUTES.PROFILE.OUTFITS,
              params: { itemIds: [item._id] }
            })
          }}
        >
          Add to outfit
        </Button>
      </SafeAreaView>
    </>
  )
}