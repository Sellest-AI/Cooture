import { useRoute, useRouter } from "@/hooks";
import { Id } from "@/lib/convex/api";
import { useItem } from "@/modules/items/_hooks/useItem";
import { ColorCategory } from "@/modules/items/category.color";
import { FeelCategory } from "@/modules/items/category.feel";
import { GenderCategory } from "@/modules/items/category.gender";
import { ItemCategory } from "@/modules/items/category.item";
import { WeatherCategory } from "@/modules/items/category.weather";
import { Block } from "@ui/block";
import { LoadingBlock } from "@ui/block.loading";
import { Button } from "@ui/button";
import { LinkIcon } from "@ui/icons";
import { Image } from "@ui/image";
import { ModalHeader } from "@ui/modal";
import { ParallaxScrollView } from "@ui/parallax-scroll-view";
import { SafeAreaView } from "@ui/safe-area-view";
import { Text } from "@ui/text";
import { Platform, View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

const ColorsBlock = () => {
  const { item } = useItem();

  if (!item) return null;

  return (
    <Block
      variant="blur"
      style={{
        borderRadius: 32,
        paddingHorizontal: 16,
        paddingVertical: 20,
        gap: 12
      }}
    >
      <Text.H4 color={Colors.neutral[50]}>
        Colors
      </Text.H4>
      <View style={{ height: 72, flexDirection: 'row', gap: 4 }}>
        {item.mainColors.slice(0, 4).map((color, i) => (
          <View
            key={color + i}
            style={{
              flex: 1,
              borderRadius: 24,
              backgroundColor: color,
              borderTopColor: Colors.blur.light,
              borderTopWidth: 2,
            }}
          />
        ))}
      </View>
    </Block>
  )
}

export default function ItemScreen() {
  const { id } = useRoute.Params<{ id: Id<'items'> }>();
  const { push, redirect } = useRouter('/item/[id]');
  const { item, isLoading, update } = useItem(id);

  if (isLoading || !item) {
    return <LoadingBlock style={{ height: 'auto' }} />
  }

  return (
    <>
      <SafeAreaView style={{ flex: 1 }} edges={{ top: 'off' }}>
        <ParallaxScrollView
          headerBackground={
            <Image
              allowDownscaling={false}
              contentFit="cover"
              blurRadius={100}
              source={item.image?.sizes.thumbnail.url}
              style={{ width: '100%', height: '100%', opacity: 0.2 }}
            />
          }
          headerContent={
            <View style={{ height: 456 }}>
              <ModalHeader
                style={{ paddingTop: 12, paddingHorizontal: 12 }}
                title={item.name}
                onBack={() => redirect({ fallbackTo: ['back', ROUTES.PROFILE.ITEMS] })}
              />
              <View style={{
                padding: 32,
                paddingBottom: Platform.OS === 'web' ? 32 : 16,
                flex: 1,
              }}>
                <Image
                  priority="high"
                  allowDownscaling={false}
                  contentFit="contain"
                  source={item.image?.sizes.medium.url}
                  placeholder={item.image?.sizes.thumbnail.url}
                  placeholderContentFit="contain"
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                />
              </View>
            </View>
          }
        >
          <View style={{ padding: 8, gap: 8 }}>
            <Block
              variant="blur"
              style={{
                borderRadius: 32,
                paddingHorizontal: 16,
                paddingVertical: 20,
                gap: 12
              }}
            >
              <Text.H4 color={Colors.neutral[50]}>
                Website link
              </Text.H4>
              <Text.Base color={Colors.neutral[200]}>
                Extract more information such as materials, price, sizes, higher quality images, etc…
              </Text.Base>
              <Button
                variant="blur"
                startIcon={LinkIcon}
              >
                Add link
              </Button>
            </Block>
            <ColorsBlock />
            {item.description && <Block
              variant="blur"
              style={{
                borderRadius: 32,
                paddingHorizontal: 16,
                paddingTop: 20,
                paddingBottom: 24,
                gap: 12
              }}
            >
              <Text.Base color={Colors.neutral[200]} numberOfLines={4}>
                {item.description}
              </Text.Base>
            </Block>}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
              <ItemCategory title={item.category} onPress={(category) => update({ category })} />
              <WeatherCategory title={item.weatherTags[0]} onPress={(weather) => update({ weatherTags: [weather, ...item.weatherTags.slice(1)] })} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
              <ColorCategory title={item.colorTones[0]} onPress={(color) => update({ colorTones: [color, ...item.colorTones.slice(1)] })} />
              <FeelCategory title={item.materialFeel} onPress={(materialFeel) => update({ materialFeel })} />
              <GenderCategory title={item.gender} onPress={(gender) => update({ gender })} />
            </View>
            <Button
              style={{ marginTop: 4 }}
              variant="primary"
              onPress={() => {
                push(ROUTES.MODALS.PICK_OUTFIT, {
                  redirectTo: ROUTES.PROFILE.OUTFITS,
                  params: { itemIds: [item._id] }
                })
              }}
            >
              Save to collection
            </Button>
          </View>
        </ParallaxScrollView>
      </SafeAreaView>
    </>
  )
}