import { ROUTES, useRouter } from "@/hooks";
import { api, useMutation, useQuery } from "@/lib/convex/client";
import { Block } from "@ui/block";
import { EmptyBlock } from "@ui/block.empty";
import { Button } from "@ui/button";
import { Col, Grid } from "@ui/grid";
import { CircleFadingArrowUp, Dices, Frown, Info, Loader } from '@ui/icons';
import { Image } from "@ui/image";
import { Pressable } from "@ui/pressable";
import { Text } from "@ui/text";
import { notEmpty } from "@utils/convex-allowed";
import { useState } from "react";
import { Dimensions, View, ViewStyle } from "react-native";
import { Colors } from "theme";
import { useDailyOutfit } from "../_hooks/useDailyOutfit";
import { RandomizerSettingsModal } from "./settings.modal";

type Props = {
  style?: ViewStyle;
}

export const OutfitRandomizerPreview = ({ style }: Props) => {
  const { isRandomizing, randomize } = useDailyOutfit.Settings();

  const [open, setOpen] = useState(false);
  const { push } = useRouter();
  const height = Dimensions.get('screen').width * (5 / 4) - 60;

  const { mutate: createOutfit } = useMutation(api.router.outfits.createOne.authed);

  const { items } = useDailyOutfit();
  const { data: queriedItems } = useQuery(api.router.items.getMany.anon, items.length > 0 ? { itemIds: items } : 'skip');

  const outfit = { items: queriedItems ?? [] }

  const outerwear = outfit.items.find(item => item.position === 'OUTERWEAR' || item.position === 'INNERLAYER');
  const top = outfit.items.find(item => (item.position === 'TOP' || item.position === 'INNERLAYER') && item._id !== outerwear?._id);
  const bottom = outfit.items.find(item => item.position === 'BOTTOM');
  const shoes = outfit.items.find(item => item.position === 'SHOES');

  const horizontalAccessories = outfit.items.filter(item => item.position === 'ACCESSORY' && (Number(item.image.aspectRatio.actual) >= 1));
  const accessories = outfit.items.filter(item => item.position === 'ACCESSORY' && !horizontalAccessories.find((o) => o._id === item._id));

  const itemIds = [outerwear, top, bottom, shoes, ...horizontalAccessories, ...accessories]
    .map(item => item?._id).filter(notEmpty);

  const hasItems = items.length > 0 || itemIds.length > 0;

  return (
    <>
      <View style={[{
        padding: 12,
        borderWidth: 1,
        borderColor: Colors.blur.dark,
        borderRadius: 28,
        aspectRatio: 4 / 5,
      }, style]}>
        <Pressable
          style={{ flex: 1 }}
          disabled={!hasItems}
          onPress={() => {
            if (!hasItems) return;
            push(ROUTES.MODALS.NEW_OUTFIT, {
              redirectTo: ROUTES.OUTFIT.PATH,
              params: {
                itemIds: itemIds
              }
            })
          }}>
          {!hasItems && <View style={{
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <EmptyBlock
              variant="secondary"
              icon={Frown}
              title="No outfit found"
              description="No outfit was found for today. Try randomizing a new one !"
              cta={{
                label: "Randomize",
                onPress: () => { setOpen(true); }
              }}
            />
          </View>}
          {hasItems && <Grid style={{
            flex: 1,
            height: height,
            gap: 12
          }}>
            <Col style={{
              flex: 1,
              justifyContent: 'center',
            }}>
              {top && <View style={{ zIndex: 1, alignItems: 'center' }}>
                <Image
                  source={top.image.sizes.medium.url}
                  style={{
                    aspectRatio: top.image.aspectRatio.actual,
                    width: '100%',
                    maxHeight: 200
                  }}
                  contentFit="contain"
                />
              </View>}
              {bottom && <View style={{
                marginTop: top ? -32 : 0,
                paddingHorizontal: 12,
                alignItems: 'center',
              }}>
                <Image
                  source={bottom.image.sizes.large.url}
                  style={{
                    aspectRatio: bottom.image.aspectRatio.actual,
                    width: '100%',
                    maxHeight: 240,
                  }}
                  contentFit="contain"
                />
              </View>}
              {shoes && <View style={{
                position: 'absolute',
                justifyContent: 'flex-end',
                bottom: 0,
                left: 20,
                right: 20,
              }}>
                <Image
                  source={shoes.image.sizes.large.url}
                  style={{ aspectRatio: shoes.image.aspectRatio.actual, width: '100%' }}
                  contentFit="contain"
                />
              </View>}
            </Col>
            <Col style={{
              flex: 1,
              justifyContent: 'space-around',
              paddingTop: 56,
              gap: 24
            }}>
              {outerwear && <View style={{ zIndex: 1 }}>
                <Image
                  source={outerwear.image.sizes.large.url}
                  style={{ aspectRatio: outerwear.image.aspectRatio.actual, width: '100%' }}
                  contentFit="contain"
                />
              </View>}
              {horizontalAccessories.map((accessory, index) => (
                <View key={index} style={{ paddingHorizontal: 12, alignItems: 'center' }}>
                  <Image
                    source={accessory.image.sizes.medium.url}
                    style={{
                      aspectRatio: accessory.image.aspectRatio.actual,
                      width: '100%',
                      maxHeight: 100,
                    }}
                    contentFit="contain"
                  />
                </View>
              ))}
              {accessories.length > 0 && (
                <Col style={{ alignItems: 'center', justifyContent: 'flex-end' }}>
                  {accessories.map((accessory, index) => (
                    <View key={index} style={{ flex: 1, minHeight: 130, maxHeight: 200 }}>
                      <Image
                        source={accessory.image.sizes.medium.url}
                        style={{
                          aspectRatio: accessory.image.aspectRatio.actual,
                          height: '100%',
                          maxWidth: 100,
                        }}
                        contentFit="contain"
                      />
                    </View>
                  ))}
                </Col>)}
            </Col>
          </Grid>}
        </Pressable>
        {hasItems && <Block
          variant="blur"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            padding: 12,
            borderRadius: 16,
            borderBottomRightRadius: 4,
          }}>
          <Info size={14} color={Colors.neutral[400]} />
          <Text.Sm color={Colors.neutral[400]}>Tap to edit</Text.Sm>
        </Block>}
        {hasItems && <Pressable
          onPress={() => setOpen(true)}
          onLongPress={async () => randomize()}
          style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
          }}>
          <Block
            variant="blur"
            style={{
              borderRadius: 99,
              padding: 12,
            }}
          >
            {isRandomizing ? <Loader size={24} color={Colors.neutral[400]} /> :
              <Dices size={24} color={Colors.foreground} />}
          </Block>
        </Pressable>}
      </View >
      <Button
        variant="primary"
        startIcon={CircleFadingArrowUp}
        style={{ marginTop: 8 }}
        onPress={async () => {
          const newOutfit = await createOutfit({ items: itemIds });
          push(ROUTES.PHOTOSHOOT.NEW, { params: { outfitId: newOutfit } });
        }}
      >
        Try on
      </Button>
      <RandomizerSettingsModal
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}