import { useRoute, useRouter } from "@/hooks";
import { api, Id } from "@/lib/convex/api";
import { useAccount } from "@/lib/convex/auth";
import { useMutation, useQuery, useQueryCached } from "@/lib/convex/client";
import { PremiumBlock } from "@/modules/premium/premium-block";
import { usePreset } from "@/modules/presets/_hooks";
import { LoadingBlock } from "@ui/block.loading";
import { Button } from "@ui/button";
import { ImageGeneration } from "@ui/cards";
import { FlashList } from "@ui/flat-list";
import { Col, Grid } from "@ui/grid";
import { CircleFadingArrowUp, Credits, Loader, Trash } from "@ui/icons";
import { Image } from "@ui/image";
import { ModalHeader } from "@ui/modal";
import { ParallaxScrollView } from "@ui/parallax-scroll-view";
import { Pressable } from "@ui/pressable";
import { SafeAreaView } from "@ui/safe-area-view";
import { Skeleton } from "@ui/skeleton";
import { Text } from "@ui/text";
import { router } from "expo-router";
import { View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

const Generation = ({ imageId, predictionId }: { imageId: Id<'images'>, predictionId: Id<'predictions'> }) => {
  const { push } = useRouter(ROUTES.PRESETS.ID.PATH);
  const { data: image } = useQueryCached(api.router.storage.images.getOne.anon, { id: imageId });

  return (
    <ImageGeneration
      source={image?.sizes.medium.url}
      onPress={() => {
        push(ROUTES.POST.PATH, {
          pathParams: { id: predictionId }
        })
      }}
    />
  )
}

const Generations = ({ customText }: { customText?: string }) => {
  const { id } = useRoute.Params<{ id: Id<'presets'> }>();
  const { preset } = usePreset(id);

  const { data: generations, isPending } = useQuery(api.router.feed.getFromPreset.anon, { presetId: id });
  const { data: recreateCount, isPending: isPendingRecreate } = useQuery(api.router.presets.recreateCount.anon, { presetId: id });

  if (!preset) return null;
  if (generations?.length === 0) return null;

  return (
    <>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 32 }}>
        <Text.H3
          color={Colors.neutral[50]}
          style={{ textAlign: 'center' }}
        >
          Generations
        </Text.H3>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
          {isPendingRecreate && <Loader size={20} color={Colors.neutral[400]} />}
          {!isPendingRecreate && <CircleFadingArrowUp size={20} color={Colors.neutral[200]} />}
          <Text.Base color={Colors.neutral[200]} weight={500}>{recreateCount}</Text.Base>
        </View>
      </View>
      <FlashList
        data={generations}
        scrollEnabled={false}
        style={{ marginTop: 20 }}
        ListEmptyComponent={<Grid style={{ height: 472, gap: 8 }}>
          <Col>
            <Skeleton style={{ flex: 1, marginBottom: 8 }} />
            <Skeleton style={{ flex: 1, marginBottom: 8 }} />
          </Col>
          <Col>
            <Skeleton style={{ flex: 1, marginBottom: 8 }} />
            <Skeleton style={{ flex: 1, marginBottom: 8 }} />
          </Col>
        </Grid>}
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
      {!isPending &&
        <Text.Base
          color={Colors.neutral[400]}
          style={{
            textAlign: 'center',
            maxWidth: 192,
            alignSelf: 'center',
            marginTop: 24,
            marginBottom: 24
          }}
        >
          {customText ?? 'No more previews available'}
        </Text.Base>}
    </>
  )
}

export default function Screen() {
  const { user: me } = useAccount();

  const { push } = useRouter(ROUTES.PRESETS.ID.PATH);
  const { id } = useRoute.Params<{ id: Id<'presets'> }>();
  const { preset } = usePreset(id);
  const { data: user } = useQuery(api.router.users.getAccount.anon, preset?.userId ? { userId: preset.userId } : 'skip');

  const { data: generations, isPending } = useQuery(api.router.feed.getFromPreset.anon, { presetId: id });
  const { mutate: deletePreset } = useMutation(api.router.presets.deleteOne.authed);

  const ownPreset = preset?.userId === me?._id;
  const editable = ownPreset && (!isPending && (generations ?? []).length === 0);

  const exit = () => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace(ROUTES.TABS.FEED)
    }
  }

  if (!preset)
    return <LoadingBlock style={{ height: 'auto', flex: 1 }} type="loader" />

  return (
    <View style={{ flex: 1 }}>
      <ParallaxScrollView
        enableExpandHeader={true}
        showsVerticalScrollIndicator={false}
        style={{
          // paddingTop: 12,
          // marginHorizontal: 12
        }}
        contentNegativeSpace={12}
        headerBackgroundImage={preset.cover?.sizes.large.url}
        headerBackgroundImagePosition="top center"
        headerBackgroundImageStyle={{ opacity: 0.4 }}
        headerContent={
          <View style={{ height: 248, paddingTop: 12 }}>
            <ModalHeader
              type="alt"
              size="big"
              title={"Preset"}
              subtitle={preset.name}
              onBack={exit}
              style={{ paddingHorizontal: 12 }}
            // endContent={
            //   <ShareIcon
            //     size={24}
            //     style={{ padding: 4 }}
            //     color={Colors.secondary[500]}
            //     onPress={() => {
            //       Share.share({
            //         title: WEBSITE.URL + ROUTES.SHARE.OUTFIT(id),
            //         url: WEBSITE.URL + ROUTES.SHARE.OUTFIT(id),
            //         message: WEBSITE.URL + ROUTES.SHARE.OUTFIT(id),
            //       })
            //     }}
            //   />
            // }
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
                Created by {user.name} {user.isPremium && <Credits size={12} />}
              </Text.Base>
            </Pressable>}
          </View>
        }
      >
        <SafeAreaView
          edges={{ top: 'off', bottom: 'android' }}
          style={{
            paddingHorizontal: 12,
            paddingBottom: 12,
            // minHeight:
            //   Dimensions.get('window').height - 248 - 12,
          }}
        >
          <Button
            variant="primary"
            startIcon={CircleFadingArrowUp}
            onPress={async () => {
              push(ROUTES.PHOTOSHOOT.RECAP, {
                params: { presetId: preset._id }
              })
            }}
          >
            Recreate
          </Button>
          <FlashList
            data={['share', 'user', 'premium', 'generations', 'cant-edit']}
            keyExtractor={(i) => i}
            renderItem={({ item }) => {
              if (item === 'premium') return <PremiumBlock style={{ marginTop: 12 }} />
              if (item === 'generations') return <Generations
                customText={(!editable && ownPreset) ?
                  "This preset has been used and is now locked to preserve your generated looks." : undefined}
              />
              return null;
            }}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
          {editable && <Button
            style={{ marginTop: 12 }}
            variant="destructive"
            startIcon={Trash}
            onLongPress={async () => {
              try {
                deletePreset({ id: preset._id });
                if (router.canGoBack()) router.back();
                else router.replace(ROUTES.TABS.FEED);
              } catch { }
            }}
          >
            Long press to delete preset
          </Button>}
        </SafeAreaView>
      </ParallaxScrollView>
    </View>
  )
}