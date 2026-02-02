import { Id } from "@/lib/convex/api";
import { downloadImageCrossPlatform } from "@/lib/image/client";
import { usePhotoshoot } from "@/modules/photoshoot/_hooks/usePhotoshoot";
import { Badge } from "@ui/badge";
import { Block } from "@ui/block";
import { Button } from "@ui/button";
import { ImageGeneration } from "@ui/cards";
import { Heart, Loader, X } from "@ui/icons";
import { Image } from "@ui/image";
import { SafeAreaView } from "@ui/safe-area-view";
import { Carousel, ICarouselInstance } from "@ui/screen-carousel";
import { Text } from "@ui/text";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import { View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

const Outfit = () => {
  const { outfit, outfitId } = usePhotoshoot.New();

  const items = outfit?.items.slice(0, 3) || [];
  const remaining = (outfit?.items.length || 0) - items.length;

  if (!outfitId) return null;

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

  return (
    <View style={{
      marginTop: 24,
      marginBottom: 24,
      alignItems: 'center'
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
          onPress={() => onNext(false)}
        >
          Reject
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
    </View>
  )
}

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: Id<'generations'> }>();
  const carouselRef = useRef<ICarouselInstance>(null);

  const { photoshoot, preset, acceptPrediction, rejectPrediction } = usePhotoshoot(id);
  const { outfitId } = usePhotoshoot.New();

  const items = (photoshoot?.predictions ?? []).map((p) => ({
    _id: p.predictionId,
    url: p.image?.url,
    status: p.status,
  }))

  const [currentIndex, setCurrentIndex] = useState(0);
  const isCurrentLoading = items[currentIndex]?.status === 'LOADING';
  const currentItem = items[currentIndex];

  // Functions
  const next = (validated: boolean) => {
    if (!currentItem) return;

    if (validated) {
      acceptPrediction(currentItem._id);
    } else {
      rejectPrediction(currentItem._id);
    }

    // Find an item that validated items does not already contain
    const nextItem = items.find(a => a.status === 'PENDING' && a._id !== currentItem._id) ??
      items.find((a) => a.status === 'LOADING' && a._id !== currentItem._id);

    // If no next item, and all items are validated or rejected, go back to profile
    if (!nextItem) return router.replace(ROUTES.PROFILE.GENERATIONS);

    const nextItemIndex = items.findIndex(i => i._id === nextItem._id);
    carouselRef.current?.scrollTo({ index: nextItemIndex, animated: true });
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Image
        source={photoshoot?.cover?.url ?? require('assets/backgrounds/dark-gradient.png')}
        blurRadius={100}
        style={{
          opacity: 0.1,
          position: 'absolute',
          inset: 0,
        }}
      />
      <SafeAreaView
        style={{
          marginTop: 16,
          paddingHorizontal: 12,
          flexDirection: 'row',
          justifyContent: outfitId ? 'space-between' : 'center',
          alignItems: 'center'
        }}
      >
        <Badge
          source={preset?.cover?.sizes.thumbnail.url
            ?? require('assets/backgrounds/dark-gradient.png')}
          contentFit="cover"
          contentPosition="top center"
        />
        <Outfit />
      </SafeAreaView>
      <View style={{
        marginTop: 32,
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
        <View style={{ flex: 1, maxHeight: 400, overflow: 'visible' }}>
          {items.length > 0 && <Carousel
            defaultIndex={currentIndex}
            ref={carouselRef}
            onProgressChange={(_, v) => {
              const value = v > items.length - 1 ? items.length - 1 : v < 0 ? 0 : v;
              setCurrentIndex(Math.ceil(value));
            }}
            scaleAnimation={true}
            items={items.map((s, i) => (
              <ImageGeneration
                key={s._id}
                loading={s.status === 'LOADING'}
                source={s.url}
                text={s.status === 'LOADING' ? "Generating..." : "Ready in 13s."}
                textScale={1.2}
                onDownload={s.url ? () => downloadImageCrossPlatform(s.url!) : undefined}
              />
            ))}
          />}
        </View>
      </View>
      <Buttons
        items={items}
        currentItem={items[currentIndex]}
        onNext={next}
      />
    </View>
  )
}