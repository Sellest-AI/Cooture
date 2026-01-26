import { Category } from "@/modules/items/category";
import { ItemCategory } from "@/modules/items/category.item";
import { Block } from "@ui/block";
import { Button } from "@ui/button";
import { Feather, LinkIcon, Smile, Snowflake, Sun } from "@ui/icons";
import { Image } from "@ui/image";
import { ParallaxScrollView } from "@ui/parallax-scroll-view";
import { SafeAreaView } from "@ui/safe-area-view";
import { Text } from "@ui/text";
import { router } from "expo-router";
import { View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

const ColorsBlock = () => {
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
        <View
          style={{
            flex: 1,
            borderRadius: 24,
            backgroundColor: 'rgba(220,255,255,1)',
            borderTopColor: Colors.blur.light,
            borderTopWidth: 2,
          }}
        />
        <View
          style={{
            flex: 1,
            borderRadius: 24,
            backgroundColor: 'rgba(24,130,180,1)',
            borderTopColor: Colors.blur.light,
            borderTopWidth: 2,
          }}
        />
        <View
          style={{
            flex: 1,
            borderRadius: 24,
            backgroundColor: 'rgba(120,130,190,1)',
            borderTopColor: Colors.blur.light,
            borderTopWidth: 2,
          }}
        />
        <View
          style={{
            flex: 1,
            borderRadius: 24,
            backgroundColor: 'rgba(70,255,180,0.5)',
            borderTopColor: Colors.blur.light,
            borderTopWidth: 2,
          }}
        />
      </View>
    </Block>
  )
}

export default function ItemScreen() {
  return (
    <>
      <ParallaxScrollView
        headerHeight={362}
        headerSpace={0}
        headerBackground={
          <Image
            contentFit="cover"
            blurRadius={100}
            source={require('assets/placeholders/blue-shirt.png')}
            style={{ width: '100%', height: '100%', opacity: 0.2 }}
          />
        }
        headerContent={
          <View style={{
            padding: 32,
            height: 362,
            flex: 1
          }}>
            <Image
              contentFit="contain"
              source={require('assets/placeholders/blue-shirt.png')}
              style={{
                width: '100%',
                height: '100%',
              }}
            />
          </View>
        }
      >
        <SafeAreaView style={{ padding: 8, gap: 8 }}>
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
              About me
            </Text.H4>
            <Text.Base color={Colors.neutral[200]} numberOfLines={4}>
              I am a grey marl sweatshirt features a dynamic, multi-colored illustration of numerous skiers in various ski suits.
              The hand-drawn style gives it a distinct vintage appeal, with each skier individually numbered…
            </Text.Base>
          </Block>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
            <ItemCategory />
            <Category icon={Snowflake} title="Cold Weather" />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
            <Category icon={Sun} title="Light" />
            <Category icon={Smile} title="Light" borderRadius={24} />
            <Category icon={Feather} title="Light" />
          </View>
          <Button
            style={{ marginTop: 4 }}
            variant="primary"
            onPress={() => {
              router.push({
                pathname: ROUTES.MODALS.PICK_OUTFIT,
                params: { nextPath: ROUTES.PROFILE.OUTFITS }
              })
            }}
          >
            Save to collection
          </Button>
        </SafeAreaView>
      </ParallaxScrollView>
    </>
  )
}