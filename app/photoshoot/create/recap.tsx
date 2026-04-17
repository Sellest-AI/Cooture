import { useRouter } from "@/hooks";
import { api, useAction, useQuery, useQueryCached } from "@/lib/convex/client";
import { useOutfit } from "@/modules/outfits/_hooks/useOutfit";
import { usePhotoshoot } from "@/modules/photoshoot/_hooks/usePhotoshoot";
import { Portrait } from "@/modules/profiles/portrait";
import { Badge } from "@ui/badge";
import { Block } from "@ui/block";
import { Button } from "@ui/button";
import { ButtonSlider } from "@ui/button.slider";
import { Col, Grid, Row } from "@ui/grid";
import { Credits, Flame, Plus, Squirish } from "@ui/icons";
import { Image } from "@ui/image";
import { LinearGradient } from "@ui/linear-gradient";
import { Pressable } from "@ui/pressable";
import { Skeleton } from "@ui/skeleton";
import { Slider } from "@ui/slider";
import { Text } from "@ui/text";
import React, { useMemo, useState } from "react";
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
            {showMore && <Row style={{
              // flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 6
            }}>
              <Squirish color={Colors.secondary[500]}
                size={52}
                style={{
                  width: '100%',
                  position: 'absolute',
                  alignSelf: 'center',
                }} />
              <Text.Base color={Colors.secondary[900]} weight={600}>
                +{grid.remaining}
              </Text.Base>
            </Row>}
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
          </Col>
        )
      })}
    </Grid>
  )
}

const OutfitComponent = () => {
  const { outfit, outfitSize, outfitSizes, setOutfitSize, hasMultipleSubjects } = usePhotoshoot.New();
  const { push } = useRouter(ROUTES.PHOTOSHOOT.RECAP);

  const sizes = outfitSizes.map((size, i) => ({
    value: Math.round((i / (outfitSizes.length - 1)) * 100) / 100,
    label: `${size[0]}${size.slice(1).toLowerCase().replaceAll('_', ' ')}`,
    defaultLabel: size,
  }));

  if (hasMultipleSubjects)
    return null;

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
            params: {
              canSkip: true,
              itemIds: outfit?.items.map(i => i._id)
            },
            redirectHere: true,
          });
        }}
      >
        {outfit ? 'Change outfit' : 'Select an outfit'}
      </Button>
    </Block>
  )
}

const FriendBlock = () => {
  const { push } = useRouter(ROUTES.PHOTOSHOOT.RECAP);
  const { hasMultipleSubjects, friendId } = usePhotoshoot.New();
  const { data: friend, isPending } = useQuery(api.router.users.getAccount.anon, friendId ? { userId: friendId } : 'skip');

  if (!hasMultipleSubjects) return null;

  return (
    <Block
      variant="blur"
      style={{
        marginBottom: 8,
        borderRadius: 32,
        paddingHorizontal: 16,
        paddingBottom: 20,
        paddingTop: 16,
        gap: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
      }}
    >
      <LinearGradient
        colors={['transparent', Colors.primary[500]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 300,
          opacity: Platform.OS === 'android' ? 0.05 : 0.1
        }}
      />
      <View style={{ gap: 8 }}>
        <View style={{
          paddingHorizontal: 12,
          paddingVertical: 6,
          backgroundColor: Colors.primary[500],
          alignSelf: 'flex-start',
          borderRadius: 99,
          marginBottom: 4,
        }}>
          <Text.Sm color={Colors.primary[900]} weight={600}>Required</Text.Sm>
        </View>
        <Text.H4 color={Colors.neutral[50]}>Friend</Text.H4>
        {(isPending && friendId) && <Skeleton style={{ width: 128, height: 18 }} />}
        {friend && <Text.Base color={Colors.neutral[400]}>{friend.name}</Text.Base>}
        {!friendId && <Text.Base color={Colors.neutral[400]}>
          Select a friend to join you.
        </Text.Base>}
      </View>
      {friend && <Pressable onPress={() => push(ROUTES.MODALS.PICK_USER, {
        redirectHere: true,
      })}>
        <Badge
          source={friend?.image}
          style={{ width: 86, height: 86, borderRadius: 99 }}
        />
      </Pressable>}
      {!friendId && <Pressable
        onPress={() => push(ROUTES.MODALS.PICK_USER, {
          redirectHere: true,
        })}
        style={{
          width: 72,
          height: 72,
          borderRadius: 99,
          backgroundColor: Colors.primary[500],
          borderWidth: 1,
          borderTopColor: Colors.primary[200],
          borderLeftColor: Colors.primary[200],
          borderRightColor: Colors.primary[500],
          borderBottomColor: Colors.primary[500],
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Plus size={32} />
      </Pressable>}
    </Block>
  )
}

export default function Screen() {
  const [numberToGenerate] = useState(1);
  const { data: cost } = useQueryCached(api.router.credits.getCost.anon, { type: 'IMAGE_GENERATION_COST', amount: numberToGenerate });
  const { data: canPay } = useQueryCached(api.router.credits.canPay.authed, cost ? { amount: cost } : 'skip');
  const { outfitId, outfitSize, presetId, friendId, disabled, hasMultipleSubjects } = usePhotoshoot.New();
  const { dismissTo, push } = useRouter(ROUTES.PHOTOSHOOT.RECAP);

  const { action, isLoading } = useAction(api.llm.triggers.photoshoot.authed);

  return (
    <View style={{ paddingHorizontal: 12 }}>
      <Button
        onPress={() => dismissTo('/photoshoot/create', { resetNextRoute: false })}
        variant="secondary"
        style={{ marginBottom: 8 }}
      >
        Change Preset
      </Button>
      <FriendBlock />
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
          disabled={disabled || isLoading}
          onComplete={async () => {
            if (!presetId) return false;
            if (disabled) return false;

            if (!canPay) {
              push(ROUTES.MODALS.UPGRADE, { redirectHere: true });
              return false;
            }

            let cancel = false;
            const timer = setTimeout(() => {
              if (cancel) return;
              if (!outfitId) return;
              cancel = true;
              dismissTo(ROUTES.GENERATIONS.PHOTOSHOOT.NEXT);
            }, 500);

            const friend = hasMultipleSubjects ? (friendId ? [friendId] : undefined) : undefined;

            const generationId = await action({
              presetId: presetId,
              numberToGenerate: numberToGenerate,
              extraUserIds: friend,
              outfit: outfitId ? {
                _id: outfitId,
                size: outfitSize
              } : undefined,
            }).catch(() => null);

            if (cancel) return true; // Successfully navigating via timer

            cancel = true;
            clearTimeout(timer);

            if (!generationId) return false; // Error creating, reset slider

            dismissTo(ROUTES.GENERATIONS.PHOTOSHOOT.PATH, {
              pathParams: { id: generationId },
            });

            return true; // Navigating away
          }}
        >
          Slide to generate
        </ButtonSlider>
        <View style={{
          gap: 4,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 12,
        }}>
          {cost && <Text.Sm
            style={{
              textAlign: 'center',
              maxWidth: 172,
            }}
            color={Colors.neutral[400]}
          >
            You will generate {numberToGenerate} image{numberToGenerate > 1 ? 's' : ''} for
          </Text.Sm>}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Credits size={12} />
            <Text.Base
              color={Colors.primary[200]} weight={600}
              style={{ marginLeft: 2 }}
            >
              {cost}
            </Text.Base>
          </View>
        </View>
      </View>
      <View style={{ height: 12 }} />
    </View>
  );
}