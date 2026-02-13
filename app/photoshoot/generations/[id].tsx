import { api, Id } from "@/lib/convex/api";
import { useQuery } from "@/lib/convex/client";
import { downloadImageCrossPlatform } from "@/lib/image/client";
import { usePhotoshoot } from "@/modules/photoshoot/_hooks/usePhotoshoot";
import { Badge } from "@ui/badge";
import { Block } from "@ui/block";
import { Button } from "@ui/button";
import { ImageGeneration } from "@ui/cards";
import { Check, Heart, Loader, X } from "@ui/icons";
import { Image } from "@ui/image";
import { SafeAreaView, useSafeAreaInsets } from "@ui/safe-area-view";
import { Carousel, ICarouselInstance } from "@ui/screen-carousel";
import { Text } from "@ui/text";
import { router, useLocalSearchParams } from "expo-router";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Platform, View } from "react-native";
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

type Generation = {
  _id: string,
  url?: string,
  status: string,
}

type Props = {
  onNext: (validated: boolean) => void;
  currentItem: Generation | undefined;
  items: Generation[];
}
const Buttons = ({ onNext, currentItem, items }: Props) => {
  const isCurrentLoading = currentItem?.status === 'LOADING';
  const processed = items.filter((i) => i.status !== 'LOADING').length;
  const loading = items.filter((i) => i.status === 'LOADING').length;

  const { bottom } = useSafeAreaInsets();

  return (
    <SafeAreaView
      edges={{ top: 'off', bottom: 'off' }}
      style={{
        paddingBottom: bottom + 28,
        alignItems: 'center',
      }}>
      {isCurrentLoading && <Block
        variant="blur"
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 12,
          paddingHorizontal: 24,
          borderRadius: 99,
          gap: 12,
        }}
      >
        <Loader color={Colors.primary[500]} />
        <Text.Base color={Colors.neutral[50]}>
          Please be patient...
        </Text.Base>
        <Text.Sm color={Colors.neutral[400]} weight={600} style={{ marginLeft: 12 }}>
          {processed} / {processed + loading}
        </Text.Sm>
      </Block>}
      {!isCurrentLoading && <View style={{
        flexDirection: 'row',
        gap: 12,
      }}
      >
        <Button
          variant="blur"
          startIcon={X}
          onPress={() => {
            if (!currentItem) return;
            onNext(false);
          }}
        >
          Archive
        </Button>
        <Button
          variant="primary"
          startIcon={Heart}
          onPress={async () => {
            if (!currentItem?.url) return;
            try {
              await downloadImageCrossPlatform(currentItem.url);
            } catch { }
            onNext(true);
          }}
        >
          Save
        </Button>
      </View>}
    </SafeAreaView>
  )
}


type AnimatedProps = {
  children: ReactNode;
  status: 'IDLE' | 'ACCEPTING' | 'REJECTING';
  onAnimationComplete?: () => void;
}
const AnimatedGeneration = ({ children, status, onAnimationComplete }: AnimatedProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const transformAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status === 'IDLE') return;
    Animated.parallel([
      Animated.timing(transformAnim, {
        toValue: status === 'ACCEPTING' ? -50 : 75,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: status === 'ACCEPTING' ? 1.05 : 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onAnimationComplete?.();
    });
  }, [onAnimationComplete, scaleAnim, opacityAnim, status, transformAnim]);

  return (
    <Animated.View
      style={{
        width: Platform.OS === 'web' ? '100%' : undefined,
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }, { translateY: transformAnim }]
      }}>
      {children}
    </Animated.View>
  )
}

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: Id<'generations'> }>();
  const carouselRef = useRef<ICarouselInstance>(null);

  const { photoshoot, preset, acceptPrediction, rejectPrediction } = usePhotoshoot(id);

  const outfitId = photoshoot?.metadata?.outfitId;

  const items = (photoshoot?.predictions ?? []).map((p) => ({
    _id: p.predictionId,
    url: p.image?.url,
    status: p.status,
  }))

  const [currentIndex, setCurrentIndex] = useState(0);
  const [animatingItem, setAnimatingItem] = useState<{ id: string, status: 'IDLE' | 'ACCEPTING' | 'REJECTING' } | null>(null);
  const [animatedItemIds, setAnimatedItemIds] = useState<Set<string>>(new Set());

  // Filter out animated items
  const visibleItems = items.filter(item => !animatedItemIds.has(item._id));

  const isCurrentLoading = visibleItems[currentIndex]?.status === 'LOADING';
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

  const handleAnimationComplete = () => {
    const currentItem = animatingItem;
    if (!currentItem) return;

    // Add to animated items set
    setAnimatedItemIds(prev => new Set([...prev, currentItem.id]));

    // Reset animation state
    setAnimatingItem(null);

    // The carousel will automatically show the next item after filtering
    // since the current item is now removed from visibleItems

    // // If no next item, and all items are validated or rejected, go back to profile
    const nextItem = visibleItems.find(item => item._id !== currentItem.id);
    if (!nextItem) return router.dismissTo(ROUTES.PROFILE.GENERATIONS);
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Image
        source={photoshoot?.cover?.sizes.large.url ?? require('assets/backgrounds/dark-gradient.png')}
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
        <Badge
          source={preset?.cover?.sizes.thumbnail.url
            ?? require('assets/backgrounds/dark-gradient.png')}
          contentFit="cover"
          contentPosition="top center"
        />
        {outfitId && <Outfit id={outfitId} />}
      </SafeAreaView>
      <View style={{
        marginTop: 28,
        alignItems: 'center',
        maxWidth: "80%",
        marginHorizontal: "auto",
      }}>
        <Text.H1 color={Colors.primary[200]}>
          {isCurrentLoading ? "Generating" : "Generated"}
        </Text.H1>
        <Text.Base color={Colors.neutral[400]} style={{ marginTop: 8, textAlign: 'center' }} weight={500}>
          {isCurrentLoading ? "This can take up to two minutes." :
            "Save the images you want in your library."}
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
        <View style={{ flex: 1, maxHeight: Dimensions.get('window').height / 2, overflow: 'visible' }}>
          {visibleItems.length > 0 && <Carousel
            defaultIndex={currentIndex}
            ref={carouselRef}
            onProgressChange={(_, v) => {
              const value = v > visibleItems.length - 1 ? visibleItems.length - 1 : v < 0 ? 0 : v;
              setCurrentIndex(Math.ceil(value));
            }}
            scaleAnimation={true}
            items={visibleItems.map((s, i) => (
              <AnimatedGeneration
                key={s._id}
                status={animatingItem?.id === s._id ? animatingItem.status : 'IDLE'}
                onAnimationComplete={handleAnimationComplete}
              >
                <ImageGeneration
                  loading={s.status === 'LOADING'}
                  source={s.url}
                  text={s.status === 'LOADING' ? "Generating..." : "Ready in 13s."}
                  textScale={1.2}
                  onDownload={s.url ? () => downloadImageCrossPlatform(s.url!) : undefined}
                />
              </AnimatedGeneration>
            ))}
          />}
        </View>
      </View>
      <Buttons
        items={visibleItems}
        currentItem={visibleItems[currentIndex]}
        onNext={next}
      />
    </View>
  )
}