import { useRoute } from "@/hooks";
import { api, Id, useMutation, useQuery } from "@/lib/convex/client";
import { downloadVideo } from "@/lib/video";
import { AnimatedGeneration } from "@/modules/generations/animated-generation";
import { GenerationButtons } from "@/modules/generations/generation-buttons";
import { UnlockMore } from "@/modules/generations/videos/unlock-more";
import { Badge } from "@ui/badge";
import { Block } from "@ui/block";
import { VideoGeneration } from "@ui/cards/video-generation";
import { ArrowLeft, Check, X } from "@ui/icons";
import { Image } from "@ui/image";
import { Pressable } from "@ui/pressable";
import { SafeAreaView } from "@ui/safe-area-view";
import { Carousel, ICarouselInstance } from "@ui/screen-carousel";
import { Text } from "@ui/text";
import { notEmpty, ROUTES } from "@utils/convex-allowed";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { Colors } from "theme";

export default function Screen() {
  const { id } = useRoute.Params<{ id: Id<'generations'> }>();
  const carouselRef = useRef<ICarouselInstance>(null);

  const { data: generation } = useQuery(api.router.generations.getOne.authed, { generationId: id });
  const videoIds = generation?.predictions.map((p) => p.videoId).filter(notEmpty) || [];
  const { data: videos } = useQuery(api.router.storage.videos.getMany.anon,
    videoIds.length > 0 ? { videoIds: videoIds } : 'skip');

  const imageIds = generation?.predictions.map((p) => p.imageId).filter(notEmpty) || [];
  const { data: images } = useQuery(api.router.storage.images.getMany.anon,
    imageIds.length > 0 ? { imageIds: imageIds } : 'skip');

  const { mutate: updatePrediction } = useMutation(api.router.generations.updatePrediction.authed);

  /** Auto publish pending predictions on unmount */
  const { mutate: publish } = useMutation(api.router.generations.publishRest.authed);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => { try { publish({ generationId: id }) } catch { } }, [])

  const items = (generation?.predictions ?? []).map((p) => ({
    _id: p._id,
    predictionId: p.predictionId,
    imageUrl: images?.find((r) => r._id === p.imageId)?.url,
    videoUrl: videos?.find((v) => v._id === p.videoId)?.url,
    status: p.status,
  }))

  const cover = images?.[0];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [animatingItem, setAnimatingItem] = useState<{ id: Id<'predictions'>, status: 'IDLE' | 'ACCEPTING' | 'REJECTING' } | null>(null);
  const [animatedItemIds, setAnimatedItemIds] = useState<Set<Id<'predictions'>>>(new Set());

  // Filter out animated items
  const visibleItems = items.filter(item => !animatedItemIds.has(item._id));

  const currentStatus = visibleItems[currentIndex] ? (
    visibleItems[currentIndex].status === 'LOADING' ? 'LOADING' : 'READY') : 'UNLOCK';
  const currentItem = visibleItems[currentIndex];

  // Functions
  const next = (validated: boolean) => {
    if (!currentItem) return;

    if (validated) {
      updatePrediction({ predictionId: currentItem.predictionId, status: 'ACCEPTED' });
    } else {
      updatePrediction({ predictionId: currentItem.predictionId, status: 'REJECTED' });
    }

    // Trigger animation
    setAnimatingItem({ id: currentItem._id, status: validated ? 'ACCEPTING' : 'REJECTING' });
  }

  const handleAnimationComplete = useCallback(() => {
    const currentItem = animatingItem;
    if (!currentItem) return;

    // Reset animation state first
    setAnimatingItem(null);

    // Small delay before removing item to allow gesture handlers to clean up
    requestAnimationFrame(() => {
      // Add to animated items set
      setAnimatedItemIds(prev => new Set([...prev, currentItem.id]));

      // Check if we should navigate away
      const nextItem = visibleItems.find(item => item._id !== currentItem.id);
      if (!nextItem) {
        const predictionId = generation?.predictions[0]?._id;
        if (predictionId) router.dismissTo(ROUTES.POST.ID(predictionId));
        else router.dismissTo(ROUTES.PROFILE.GENERATIONS);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animatingItem])

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
      <SafeAreaView
        edges={{ bottom: 'off' }}
        style={{
          paddingTop: 16,
          paddingHorizontal: 12,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          gap: 8,
        }}>
          <Pressable onPress={() => router.back()}
            style={{ position: 'absolute', left: 0 }}
          >
            <Block variant="blur"
              style={{ borderRadius: 99, padding: 12 }}>
              <ArrowLeft size={24} color={Colors.foreground} />
            </Block>
          </Pressable>
          <Badge
            source={cover?.sizes.thumbnail.url
              ?? require('assets/backgrounds/dark-gradient.png')}
            contentFit="cover"
            contentPosition="center"
          />
        </View>
      </SafeAreaView>
      <View style={{
        marginTop: 28,
        alignItems: 'center',
        maxWidth: "80%",
        marginHorizontal: "auto",
      }}>
        <Text.H1 color={Colors.primary[200]}>
          {currentStatus === 'LOADING' ? "Generating" :
            currentStatus === 'READY' ? "Generated" : "Unlock"}
        </Text.H1>
        <Text.Base color={Colors.neutral[400]} style={{ marginTop: 8, textAlign: 'center' }} weight={500}>
          {currentStatus === 'LOADING' ? "This can take up to two minutes." :
            currentStatus === 'READY' ? "Save the generations you like in your library." :
              "Unlock more generations."}
        </Text.Base>
      </View>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        {(animatingItem && animatingItem?.status !== 'IDLE') && <View style={{
          position: 'absolute',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}>
          {animatingItem?.status === 'ACCEPTING' && <View style={{ padding: 24, borderRadius: 99, backgroundColor: Colors.primary[900] }}>
            <Check size={48} color={Colors.primary[500]} />
          </View>}
          {animatingItem?.status === 'REJECTING' && <View style={{ padding: 24, borderRadius: 99, backgroundColor: Colors.neutral[800] }}>
            <X size={48} color={Colors.neutral[400]} />
          </View>}
        </View>}
        <View style={{
          flex: 1,
          overflow: 'visible',
          justifyContent: 'center',
          paddingVertical: 24,
        }}>
          {visibleItems.length > 0 && <Carousel
            itemHeight={460}
            defaultIndex={currentIndex}
            ref={carouselRef}
            onProgressChange={(_, v) => {
              const length = visibleItems.length + 1;
              const value = v > length - 1 ? length - 1 : v < 0 ? 0 : v;
              setCurrentIndex(Math.ceil(value));
            }}
            scaleAnimation={true}
            items={[...visibleItems, undefined]
              .map((s, i) => {
                if (s === undefined)
                  return (
                    <AnimatedGeneration key={i} status={'IDLE'}>
                      <UnlockMore
                        predictionId={items[0]?._id}
                      />
                    </AnimatedGeneration>
                  )

                const source = s.status !== 'LOADING' ? s.videoUrl :
                  (s.imageUrl ?? cover?.sizes.thumbnail.url);

                if (!source) return null;

                return (
                  <AnimatedGeneration
                    key={s._id}
                    status={animatingItem?.id === s._id ? animatingItem.status : 'IDLE'}
                    onAnimationComplete={handleAnimationComplete}
                  >
                    <VideoGeneration
                      loading={s.status === 'LOADING'}
                      source={source}
                      text={s.status === 'LOADING' ? "Generating..." : "Ready in 13s."}
                      onDownload={async () => {
                        if (s.videoUrl) await downloadVideo(s.videoUrl);
                      }}
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