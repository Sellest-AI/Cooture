import { api, Id } from "@/lib/convex/api";
import { useQuery } from "@/lib/convex/client";
import { downloadImageCrossPlatform } from "@/lib/image/client";
import { presentPaywallIfNeeded } from "@/lib/revenue-cat";
import { AnimatedGeneration } from "@/modules/generations/animated-generation";
import { GenerationButtons } from "@/modules/generations/generation-buttons";
import { UnlockMore } from "@/modules/generations/images/unlock-more";
import { usePhotoshoot } from "@/modules/photoshoot/_hooks/usePhotoshoot";
import { Badge } from "@ui/badge";
import { Block } from "@ui/block";
import { ImageGeneration } from "@ui/cards";
import { ArrowLeft, Check, X } from "@ui/icons";
import { Image } from "@ui/image";
import { Pressable } from "@ui/pressable";
import { SafeAreaView } from "@ui/safe-area-view";
import { Carousel, ICarouselInstance } from "@ui/screen-carousel";
import { Text } from "@ui/text";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

const Outfit = ({ id }: { id: Id<'outfits'> }) => {
  const { data: outfit } = useQuery(api.router.outfits.getOne.anon, { outfitId: id });

  const items = outfit?.items.slice(0, 3) || [];
  const remaining = (outfit?.items.length || 0) - items.length;

  if (!outfit) return null;

  return (
    <View style={{
      flexDirection: 'row',
    }}>
      {items.map((item, i) => (
        <Badge
          source={item.image.sizes.thumbnail.url}
          style={{
            marginRight: (remaining === 0 && i === items.length - 1) ? 0 : -16
          }}
          contentFit="contain"
          key={item._id}
        />
      ))}
      {remaining > 0 && <Badge text={`+${remaining}`} />}
    </View>
  )
}

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: Id<'generations'> }>();
  const carouselRef = useRef<ICarouselInstance>(null);

  const { photoshoot, results, preset, acceptPrediction, rejectPrediction, publishRest } = usePhotoshoot(id);

  /** Auto publish pending predictions on unmount */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => { try { publishRest() } catch { } }, [])

  const outfitId = photoshoot?.outfitId;

  const items = (photoshoot?.predictions ?? []).map((p) => ({
    _id: p._id,
    providerId: p.predictionId,
    imageUrl: results?.find((r) => r._id === p.imageId)?.url,
    status: p.status,
  }))

  const cover = results?.find((r) => r._id === photoshoot?.coverId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [animatingItem, setAnimatingItem] = useState<{ id: string, status: 'IDLE' | 'ACCEPTING' | 'REJECTING' } | null>(null);
  const [animatedItemIds, setAnimatedItemIds] = useState<Set<string>>(new Set());

  // Filter out animated items
  const visibleItems = items.filter(item => !animatedItemIds.has(item.providerId));

  const currentStatus = visibleItems[currentIndex] ? (
    visibleItems[currentIndex].status === 'LOADING' ? 'LOADING' : 'READY') : 'UNLOCK';
  const currentItem = visibleItems[currentIndex];

  // Functions
  const next = async (validated: boolean) => {
    if (!currentItem) return;

    // Trigger animation
    setAnimatingItem({ id: currentItem.providerId, status: validated ? 'ACCEPTING' : 'REJECTING' });

    if (validated) {
      acceptPrediction(currentItem.providerId).catch(() => null);
    } else {
      rejectPrediction(currentItem.providerId).catch(() => null);
    }
  }

  const handleAnimationComplete = useCallback(() => {
    const currentItem = animatingItem;
    if (!currentItem) return;

    // Reset animation state first
    setAnimatingItem(null);

    // Small delay before removing item to allow gesture handlers to clean up
    requestAnimationFrame(async () => {
      // Add to animated items set
      setAnimatedItemIds(prev => new Set([...prev, currentItem.id]));

      // Check if we should navigate away
      const nextItem = visibleItems.find(item => item.providerId !== currentItem.id);
      if (!nextItem) {
        await presentPaywallIfNeeded();
        const predictionId = photoshoot?.predictions[0]?._id;
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
          justifyContent: outfitId ? 'space-between' : 'center',
          alignItems: 'center',
        }}
      >
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: outfitId ? 'flex-start' : 'center',
          width: outfitId ? undefined : '100%',
          gap: 8,
        }}>
          <Pressable onPress={() => router.back()}
            style={{ position: outfitId ? 'relative' : 'absolute', left: outfitId ? undefined : 0 }}
          >
            <Block variant="blur"
              style={{ borderRadius: 99, padding: 12 }}>
              <ArrowLeft size={24} color={Colors.foreground} />
            </Block>
          </Pressable>
          <Badge
            source={preset?.cover?.sizes.thumbnail.url
              ?? require('assets/backgrounds/dark-gradient.png')}
            contentFit="cover"
            contentPosition="top center"
          />
        </View>
        {outfitId && <Outfit id={outfitId} />}
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
                      <UnlockMore />
                    </AnimatedGeneration>
                  )

                const isFailed = s.status === 'FAILED' ||
                  (s.status !== 'LOADING' && !s.imageUrl);

                return (
                  <AnimatedGeneration
                    key={s.providerId}
                    status={animatingItem?.id === s.providerId ? animatingItem.status : 'IDLE'}
                    onAnimationComplete={handleAnimationComplete}
                  >
                    <ImageGeneration
                      loading={s.status === 'LOADING'}
                      source={s.imageUrl}
                      text={s.status === 'LOADING' ? "Generating..." :
                        isFailed ? "Failed" : "Ready"}
                      onDownload={s.imageUrl ? () => downloadImageCrossPlatform(s.imageUrl!, { applyWatermark: true }) : undefined}
                    />
                    {isFailed && <View style={{
                      position: 'absolute',
                      justifyContent: 'center',
                      alignItems: 'center',
                      inset: 0,
                    }}>
                      <Text.Base color={Colors.neutral[400]}
                        style={{ textAlign: 'center', maxWidth: '70%', marginTop: -32 }}
                        weight={500}>
                        This generation failed. You have not been charged for it.
                      </Text.Base>
                      <Text.Base color={Colors.neutral[400]}
                        style={{ textAlign: 'center', maxWidth: '70%', marginTop: 16 }}
                        weight={500}>
                        Please try again.
                      </Text.Base>
                    </View>}
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