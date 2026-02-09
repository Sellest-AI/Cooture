import { useRouter } from "@/hooks";
import { api, useAction } from "@/lib/convex/client";
import { useOutfit } from "@/modules/outfits/_hooks/useOutfit";
import { usePhotoshoot } from "@/modules/photoshoot/_hooks/usePhotoshoot";
import { usePortraits } from "@/modules/profiles/_hooks/usePortraits";
import { Block } from "@ui/block";
import { Button } from "@ui/button";
import { ButtonSlider } from "@ui/button.slider";
import { Col, Grid, Row } from "@ui/grid";
import { Flame, Pencil, Squirish } from "@ui/icons";
import { Image } from "@ui/image";
import { Slider } from "@ui/slider";
import { Text } from "@ui/text";
import React, { useMemo } from "react";
import { Platform, View, ViewStyle } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

type Items = NonNullable<ReturnType<typeof useOutfit>['outfit']>['items'];
type Item = Items[number];

const OutfitGrid = ({ items, style }: { items: Items, style?: ViewStyle }) => {
  const isPortrait = (item: Item) => (item.image.height * 1.2) >= item.image.width;
  const HEIGHT = style?.height ?? 150;

  const grid = useMemo(() => {
    const columns: Item[][] = [];
    columns.push(...items.filter(isPortrait).map((i) => [i]));

    // Pack others by 2
    const filtered = items.filter(i => !isPortrait(i));
    for (let i = 0; i < filtered.length; i += 2) {
      const next = filtered[i + 1];
      if (next) columns.push([filtered[i], next]);
      else columns.push([filtered[i]]);
    }

    const maxColumns = columns.slice(0, 4);
    const itemsAmount = maxColumns.reduce((acc, current) => acc + current.length, 0);

    return {
      array: maxColumns,
      hasMore: items.length > itemsAmount,
      remaining: items.length - itemsAmount,
    }
  }, [items])

  return (
    <Grid style={{ height: HEIGHT, ...style }}>
      {grid.array.map((_items, i) => {
        const isLast = i === grid.array.length - 1;
        const showMore = (isLast && grid.hasMore);
        const items = showMore ? _items.slice(0, 1) : _items;

        return (
          <Col
            style={{ height: HEIGHT, padding: 8 }}
            key={items.map(i => i._id).join('-')}
          >
            {items.map((item, index) => item && <Row
              key={item._id} style={{ marginBottom: index === 0 ? 8 : 0 }}
            >
              <Image
                style={{ flex: 1 }}
                source={item.image.sizes.small.url}
                contentFit="contain"
              />
            </Row>
            )}
            {showMore && <Row style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Squirish color={Colors.secondary[500]}
                style={{
                  width: '80%',
                  position: 'absolute',
                  alignSelf: 'center',
                }} />
              <Text.Base color={Colors.secondary[900]} weight={600}>
                +{grid.remaining}
              </Text.Base>
            </Row>}
          </Col>
        )
      })}
    </Grid>
  )
}

const Portrait = ({ style }: { style?: ViewStyle }) => {
  const { frontImage, sideImage, smileImage, isPending } = usePortraits();
  const { push } = useRouter(ROUTES.PHOTOSHOOT.RECAP);

  const HEIGHT = style?.height ?? 256;

  if (!frontImage && !isPending) return <useRouter.Redirect
    href={ROUTES.EXTRA.UPDATE_PORTRAITS}
    redirectTo={ROUTES.PHOTOSHOOT.RECAP}
  />

  return (
    <>
      <Grid style={{ width: '100%', ...style, height: HEIGHT }}>
        <Col style={{ height: HEIGHT, borderRadius: 64, backgroundColor: Colors.blur.medium }}>
          <Image
            source={frontImage?.url}
            style={{ borderRadius: 64, flex: 1, borderWidth: 1, borderColor: Colors.blur.medium }}
          />
        </Col>
        <Col style={{ height: HEIGHT, marginLeft: 12, minWidth: 120, width: 120 }}>
          <Row style={{ marginBottom: 12, borderRadius: 48, backgroundColor: Colors.blur.medium }}>
            <Image
              source={sideImage?.sizes.medium.url}
              style={{ borderRadius: 48, flex: 1, borderWidth: 1, borderColor: Colors.blur.medium }}
            />
          </Row>
          <Row style={{ borderRadius: 48, backgroundColor: Colors.blur.medium }}>
            <Image
              source={smileImage?.sizes.medium.url}
              style={{ borderRadius: 48, flex: 1, borderWidth: 1, borderColor: Colors.blur.medium }}
            />
          </Row>
        </Col>
      </Grid>
      <Button
        variant="blur"
        startIcon={Pencil}
        style={{ marginTop: 12 }}
        onPress={() => {
          push(ROUTES.EXTRA.UPDATE_PORTRAITS, {
            redirectHere: true
          })
        }}
      >
        Edit my portraits
      </Button>
    </>
  )
}


const OutfitComponent = () => {
  const { outfit, outfitSize, outfitSizes, setOutfitSize } = usePhotoshoot.New();
  const { push } = useRouter(ROUTES.PHOTOSHOOT.RECAP);

  const sizes = outfitSizes.map((size, i) => ({
    value: Math.round((i / (outfitSizes.length - 1)) * 100) / 100,
    label: `${size[0]}${size.slice(1).toLowerCase().replaceAll('_', ' ')}`,
    defaultLabel: size,
  }));

  return (
    <Block
      variant="blur"
      style={{
        borderRadius: 32,
        paddingHorizontal: 16,
        paddingVertical: 20,
        gap: 12,
        marginTop: 8,
      }}
    >
      <Text.H4 color={Colors.neutral[50]}>Custom Outfit</Text.H4>
      {outfit && <Text.Base color={Colors.neutral[400]}>
        This outfit will be used for your photoshoot.
      </Text.Base>}
      {!outfit && <Text.Base color={Colors.neutral[400]}>
        We&apos;ll use the model&apos;s default wardrobe instead.
      </Text.Base>}
      {outfit && <OutfitGrid items={outfit.items} />}
      {outfit && <Slider
        value={sizes.find(s => s.defaultLabel === outfitSize)?.value ?? 0}
        onValueChange={(v) => {
          const closest = sizes.reduce((prev, curr) => {
            return (Math.abs(curr.value - v) < Math.abs(prev.value - v) ? curr : prev);
          });
          setOutfitSize(closest.defaultLabel);
        }}
        customHeight={36}
        labels={sizes}
        label="Fit"
      />}
      <Button
        style={{ marginTop: 8 }}
        variant="blur"
        onPress={() => {
          push(ROUTES.MODALS.PICK_OUTFIT, {
            params: { canSkip: true },
            redirectHere: true,
          });
        }}
      >
        {outfit ? 'Change outfit' : 'Select an outfit'}
      </Button>
    </Block>
  )
}

export default function Screen() {
  const { outfitId, outfitSize, presetId, setOutfitId, setPresetId, reset } = usePhotoshoot.New();
  const { replace, dismissTo } = useRouter(ROUTES.PHOTOSHOOT.RECAP, {
    onInit: ({ outfitId, presetId }) => {
      if (outfitId) setOutfitId(outfitId);
      if (presetId) setPresetId(presetId);
    },
    resetFnc: reset,
  });

  const { action } = useAction(api.llm.triggers.photoshoot.authed);

  return (
    <View style={{ paddingHorizontal: 12 }}>
      <Button
        onPress={() => dismissTo('/photoshoot/create', { resetNextRoute: false })}
        variant="secondary"
        style={{ marginBottom: 8 }}
      >
        Change Preset
      </Button>
      <Block
        variant="blur"
        style={{
          borderRadius: 32,
          paddingHorizontal: 16,
          paddingVertical: 20,
          gap: 12,
        }}
      >
        <Text.H4 color={Colors.neutral[50]}>Portrait</Text.H4>
        <Text.Base color={Colors.neutral[400]}>Make sure your portrait images are up to date.</Text.Base>
        <Portrait style={{ marginTop: 16 }} />
      </Block>
      <OutfitComponent />
      <View style={{ flex: 1, justifyContent: 'flex-end', marginTop: 12 }}>
        <ButtonSlider
          startIcon={Flame}
          onComplete={async () => {
            if (!presetId) return;

            const generationId = await action({
              presetId: presetId,
              outfit: outfitId ? {
                _id: outfitId,
                size: outfitSize
              } : undefined,
            });

            replace(ROUTES.PHOTOSHOOT.GENERATIONS.PATH, {
              pathParams: { id: generationId },
            })
          }}
        >
          Slide to generate
        </ButtonSlider>
      </View>
      {Platform.OS !== 'web' && <View style={{ height: 12 }} />}
    </View>
  );
}