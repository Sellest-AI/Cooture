import { api, Id, useAction, useMutation, useQuery, useQueryCached } from "@/lib/convex/client";
import { AnimatedGeneration } from "@/modules/photoshoot/animated-generation";
import { GenerationButtons } from "@/modules/photoshoot/generation-buttons";
import { Button } from "@ui/button";
import { ImageGeneration } from "@ui/cards";
import { Plus } from "@ui/icons";
import { Image } from "@ui/image";
import { Pressable } from "@ui/pressable";
import { Carousel, ICarouselInstance } from "@ui/screen-carousel";
import { Text } from "@ui/text";
import { notEmpty } from "@utils/convex-allowed";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { Dimensions, View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

const UnlockMore = () => {
  const { id } = useLocalSearchParams<{ id: Id<'generations'> }>();

  const { data: photoshoot } = useQuery(api.router.generations.getOne.admin, id ? { generationId: id } : 'skip');
  const { action, isLoading } = useAction(api.llm.triggers.photoshoot.admin);

  return (
    <View style={{
      flex: 1,
      width: '100%',
    }}>
      <Pressable
        style={{
          backgroundColor: Colors.blur.darkest,
          borderColor: Colors.blur.medium,
          borderTopWidth: 2,
          borderLeftWidth: 1,
          borderRadius: 24,
          aspectRatio: 3 / 4,
          width: '100%',
          overflow: 'hidden',
        }}>
        <Image
          style={{ position: 'absolute', inset: 0, opacity: 0.4 }}
          source={require('assets/backgrounds/dark-gradient.png')}
          contentFit="cover"
          contentPosition="center"
          blurRadius={20}
        />
        <View style={{
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale: 1.2 }],
          flex: 1,
        }}>
          <Text.H3 color={Colors.primary[500]} style={{ maxWidth: '65%', textAlign: 'center' }}>
            New
          </Text.H3>
          <Text.Lg color={Colors.neutral[50]} weight={600}
            style={{
              maxWidth: '55%',
              textAlign: 'center',
              marginTop: 16,

            }}
          >
            Generate one more image
          </Text.Lg>
          <Button
            variant="primary"
            style={{ marginTop: 32 }}
            align="center"
            startIcon={Plus}
            isLoading={isLoading}
            onPress={async () => {
              if (!photoshoot) return;

              const friendId = photoshoot.userIds?.find((id) => id !== photoshoot.userId) ?? null;
              const outfitId = photoshoot.outfitId;
              const presetId = photoshoot.presetId;

              if (!presetId) return;

              await action({
                userId: photoshoot.userId,
                generationId: photoshoot._id,
                presetId: presetId,
                numberToGenerate: 1,
                extraUserIds: friendId ? [friendId] : undefined,
                outfit: outfitId ? {
                  _id: outfitId,
                  size: "LOOSE"
                } : undefined,
              });
            }}
          >
            Generate
          </Button>
        </View>
      </Pressable>
      <View style={{
        marginTop: 8,
        paddingHorizontal: 8,
        justifyContent: 'space-between',
        flexDirection: 'row',
      }}>
        <Text.Base color={Colors.neutral[400]} style={{
          transform: [{ scale: 1.2 }],
          transformOrigin: 'left top',
        }}>
          New
        </Text.Base>
        <Plus size={18} color={Colors.primary[500]} />
      </View>
    </View>
  )
}

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: Id<'generations'> }>();
  const carouselRef = useRef<ICarouselInstance>(null);

  const { mutate } = useMutation(api.router.generations.updatePrediction.admin);
  const { data: photoshoot } = useQuery(api.router.generations.getOne.admin, id ? { generationId: id } : 'skip');
  const imageIds = photoshoot?.predictions.map((p) => p.imageId).filter(notEmpty);
  const { data: results } = useQueryCached(api.router.storage.images.getMany.anon, imageIds ? { imageIds } : 'skip');

  const items = (photoshoot?.predictions ?? []).map((p) => ({
    _id: p.predictionId,
    url: results?.find((r) => r._id === p.imageId)?.url,
    status: p.status,
  }))

  const cover = results?.find((r) => r._id === photoshoot?.coverId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [hiddenItems, setHiddenItems] = useState<string[]>([]);

  const visibleItems = items.filter(item => !hiddenItems.includes(item._id));

  // Filter out animated items
  const currentItem = visibleItems[currentIndex];

  // Functions
  const next = (validated: boolean) => {
    if (!currentItem) return;

    if (validated) {
      mutate({ predictionId: currentItem._id, status: 'ACCEPTED' });
    } else {
      mutate({ predictionId: currentItem._id, status: 'REJECTED' });
    }

    setHiddenItems(prev => [...prev, currentItem._id]);

    // Trigger animation
    const nextItem = visibleItems.find(item => item._id !== currentItem._id);
    if (!nextItem) return router.dismissTo(ROUTES.PROFILE.GENERATIONS);
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Image
        source={cover?.sizes.large.url ?? require('assets/backgrounds/dark-gradient.png')}
        blurRadius={100}
        style={{
          opacity: 0.1,
          position: 'absolute',
          inset: 0,
        }}
      />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={{ flex: 1, maxHeight: Dimensions.get('window').height / 2, overflow: 'visible' }}>
          {visibleItems.length > 0 && <Carousel
            defaultIndex={currentIndex}
            ref={carouselRef}
            onProgressChange={(_, v) => {
              const value = v > visibleItems.length - 1 ? visibleItems.length - 1 : v < 0 ? 0 : v;
              setCurrentIndex(Math.ceil(value));
            }}
            scaleAnimation={true}
            items={[...visibleItems, undefined].map((s, i) => {
              if (s === undefined)
                return (
                  <AnimatedGeneration key={i} status={'IDLE'}>
                    <UnlockMore />
                  </AnimatedGeneration>
                )

              return (
                <AnimatedGeneration
                  key={s._id}
                  status={'IDLE'}
                >
                  <ImageGeneration
                    loading={s.status === 'LOADING'}
                    source={s.url}
                    text={s.status === 'LOADING' ? "Generating..." : "Ready in 13s."}
                    textScale={1.2}
                  />
                </AnimatedGeneration>
              )
            })}
          />}
        </View>
      </View>
      <GenerationButtons
        items={visibleItems}
        currentItem={visibleItems[currentIndex]}
        onNext={next}
      />
    </View>
  )
}