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
import { useSafety } from "@/modules/safety";
import { Block } from "@ui/block";
import { LoadingBlock } from "@ui/block.loading";
import { Button, BUTTON_HEIGHT } from "@ui/button";
import { ReportModal } from "@ui/cards/report.modal";
import { ExternalLink, LinkIcon, TriangleAlert } from "@ui/icons";
import { Image } from "@ui/image";
import { ModalHeader } from "@ui/modal";
import { ParallaxScrollView } from "@ui/parallax-scroll-view";
import { Pressable } from "@ui/pressable";
import { SafeAreaView } from "@ui/safe-area-view";
import { Text } from "@ui/text";
import * as Linking from 'expo-linking';
import { router } from "expo-router";
import { usePostHog } from "posthog-react-native";
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

const DeleteItemButton = () => {
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
  const posthog = usePostHog();
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

  if (isOwner && canOpen) return (
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
        onPress={() => {
          if (!item?.link) return;
          Linking.openURL(item.link);
        }}
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
      onPress={() => {
        if (!item?.link) return;
        Linking.openURL(item.link);
        posthog.capture('item_link_opened', { itemId: item._id });
      }}
    >
      Open website
    </Button>
  )
}

const ReportContentButton = () => {
  const { reportContent } = useSafety();
  const { id } = useRoute.Params<{ id: Id<'items'> }>();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Pressable style={{
        alignSelf: 'center',
        marginTop: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
      }}
        onPress={() => setShowModal(true)}
      >
        <TriangleAlert size={16} color={Colors.destructive[500]} />
        <Text.Base color={Colors.neutral[400]} weight={500}>Report item</Text.Base>
      </Pressable>
      <ReportModal
        open={showModal}
        onCancel={() => setShowModal(false)}
        onComplete={() => {
          setShowModal(false);
          if (router.canGoBack()) router.back();
          else router.dismissTo(ROUTES.HOME);
        }}
        report={{
          itemId: id,
          onReport: ({ reason }) => reportContent({ itemId: id, reason })
        }}
      />
    </>
  )
}

export default function ItemScreen() {
  const { id } = useRoute.Params<{ id: Id<'items'> }>();
  const { push, redirect } = useRouter('/item/[id]');
  const { item, isLoading, update } = useItem(id);

  const { user } = useAccount();
  const disabled = (id: Id<'users'>) => user?._id !== id;

  const isOwner = item?.userId === user?._id;

  if (isLoading || !item) {
    return <LoadingBlock style={{ height: 'auto' }} type="logo" />
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
            <ItemCategory title={item.category} onPress={(category) => update({ category })} disabled={disabled(item.userId)} />
            <WeatherCategory title={item.weatherTags[0]} onPress={(weather) => update({ weatherTags: [weather, ...item.weatherTags.slice(1)] })} disabled={disabled(item.userId)} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
            <ColorCategory title={item.colorTones[0]} onPress={(color) => update({ colorTones: [color, ...item.colorTones.slice(1)] })} disabled={disabled(item.userId)} />
            <FeelCategory title={item.materialFeel} onPress={(materialFeel) => update({ materialFeel })} disabled={disabled(item.userId)} />
            <GenderCategory title={item.gender} onPress={(gender) => update({ gender })} disabled={disabled(item.userId)} />
          </View>
          <DeleteItemButton />
          {!isOwner && <ReportContentButton />}
        </SafeAreaView>
      </ParallaxScrollView>
      <SafeAreaView
        edges={{ bottom: 'android' }}
        style={{
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 20 : 0,
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