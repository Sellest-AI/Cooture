import { useRouter } from "@/hooks";
import { api, Id } from "@/lib/convex/api";
import { useAccount } from "@/lib/convex/auth";
import { useAction, useQuery, useQueryCached } from "@/lib/convex/client";
import { downloadImageCrossPlatform } from "@/lib/image/client";
import { usePhotoshoot } from "@/modules/photoshoot/_hooks/usePhotoshoot";
import { AnimatedGeneration } from "@/modules/photoshoot/animated-generation";
import { GenerationButtons } from "@/modules/photoshoot/generation-buttons";
import { Badge } from "@ui/badge";
import { Block } from "@ui/block";
import { Button } from "@ui/button";
import { ImageGeneration } from "@ui/cards";
import { ArrowLeft, Check, Lock, X } from "@ui/icons";
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

const UnlockMore = () => {
  const { push } = useRouter();
  const { id } = useLocalSearchParams<{ id: Id<'generations'> }>();
  const { preset, photoshoot } = usePhotoshoot(id);

  const { data: cost } = useQueryCached(api.router.credits.getCost.anon, { type: "IMAGE_GENERATION_COST", amount: 1 });
  const { data: canPay } = useQueryCached(api.router.credits.canPay.authed, cost ? { amount: cost } : 'skip');

  const { isPremium } = useAccount();

  const disabled = isPremium ? !canPay : false;

  const { outfitSize } = usePhotoshoot.New();
  const { action, isLoading } = useAction(api.llm.triggers.photoshoot.authed);

  return (
    <View style={{
      flex: 1,
      width: '100%',
    }}>
      <Pressable
        disabled={disabled}
        animated={disabled}
        style={{
          backgroundColor: Colors.blur.darkest,
          borderColor: Colors.blur.medium,
          borderTopWidth: 2,
          borderLeftWidth: 1,
          borderRadius: 24,
          aspectRatio: 3 / 4,
          width: '100%',
          overflow: 'hidden',
          opacity: disabled ? 0.4 : 1,
        }}>
        <Image
          style={{ position: 'absolute', inset: 0, opacity: 0.4 }}
          source={preset?.cover?.sizes.large.url ?? require('assets/backgrounds/dark-gradient.png')}
          contentFit="cover"
          contentPosition="center"
          blurRadius={20}
        />
        {isPremium && <View style={{
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
        }}>
          <Text.H3 color={Colors.primary[500]} style={{ maxWidth: '65%', textAlign: 'center' }}>
            Unlock
          </Text.H3>
          <Text.Lg color={Colors.neutral[50]} weight={600}
            style={{
              maxWidth: '55%',
              textAlign: 'center',
              marginTop: 16,
            }}
          >
            Get access to this image for {cost} credits
          </Text.Lg>
          <Button
            variant="primary"
            style={{ marginTop: 32 }}
            align="center"
            startIcon={Lock}
            isLoading={isLoading}
            onPress={async () => {
              if (!preset) return;
              if (!photoshoot) return;

              const friendId = photoshoot.userIds?.find((id) => id !== photoshoot.userId) ?? null;
              const outfitId = photoshoot.outfitId;

              await action({
                generationId: photoshoot._id,
                presetId: preset._id,
                numberToGenerate: 1,
                extraUserIds: friendId ? [friendId] : undefined,
                outfit: outfitId ? {
                  _id: outfitId,
                  size: outfitSize
                } : undefined,
              });
            }}
          >
            Unlock
          </Button>
        </View>}
        {!isPremium && <View style={{
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
        }}>
          <Text.H3 color={Colors.primary[500]} style={{ maxWidth: '65%', textAlign: 'center' }}>
            Unlock
          </Text.H3>
          <Text.Lg color={Colors.neutral[50]} weight={600}
            style={{
              maxWidth: '55%',
              textAlign: 'center',
              marginTop: 16,
            }}
          >
            Get access to this image and way more
          </Text.Lg>
          <Button
            variant="primary"
            style={{ marginTop: 32 }}
            align="center"
            startIcon={Lock}
            onPress={() => push(ROUTES.MODALS.UPGRADE)}
          >
            Unlock
          </Button>
        </View>}
      </Pressable>
      <View style={{
        marginTop: 8,
        paddingHorizontal: 8,
        justifyContent: 'space-between',
        flexDirection: 'row',
      }}>
        <Text.Sm color={Colors.neutral[400]} style={{
          transform: [{ scale: 1.2 }],
          transformOrigin: 'left top',
        }}>
          Locked
        </Text.Sm>
        <Lock size={18} color={Colors.primary[500]} />
      </View>
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
    _id: p.predictionId,
    url: results?.find((r) => r._id === p.imageId)?.url,
    status: p.status,
  }))

  const cover = results?.find((r) => r._id === photoshoot?.coverId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [animatingItem, setAnimatingItem] = useState<{ id: string, status: 'IDLE' | 'ACCEPTING' | 'REJECTING' } | null>(null);
  const [animatedItemIds, setAnimatedItemIds] = useState<Set<string>>(new Set());

  // Filter out animated items
  const visibleItems = items.filter(item => !animatedItemIds.has(item._id));

  const currentStatus = visibleItems[currentIndex] ? (
    visibleItems[currentIndex].status === 'LOADING' ? 'LOADING' : 'READY') : 'UNLOCK';
  const currentItem = visibleItems[currentIndex];

  // Functions
  const next = (validated: boolean) => {
    if (!currentItem) return;

    if (validated) {
      acceptPrediction(currentItem._id);
    } else {
      rejectPrediction(currentItem._id);
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
        router.dismissTo(ROUTES.PROFILE.GENERATIONS);
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
            currentStatus === 'READY' ? "Save the images you want in your library." :
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
        }}>
          {visibleItems.length > 0 && <Carousel
            itemHeight={430}
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

                return (
                  <AnimatedGeneration
                    key={s._id}
                    status={animatingItem?.id === s._id ? animatingItem.status : 'IDLE'}
                    onAnimationComplete={handleAnimationComplete}
                  >
                    <ImageGeneration
                      loading={s.status === 'LOADING'}
                      source={s.url}
                      text={s.status === 'LOADING' ? "Generating..." : "Ready in 13s."}
                      onDownload={s.url ? () => downloadImageCrossPlatform(s.url!) : undefined}
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