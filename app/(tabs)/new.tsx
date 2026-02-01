import { useRouter } from "@/hooks";
import { TOTAL_TABS_SPACE } from "@/modules/tabs";
import { Block } from "@ui/block";
import { Button } from "@ui/button";
import { Collection } from "@ui/cards";
import { ArrowUpRight, Bell, ScanLine } from "@ui/icons";
import { Link } from "@ui/link";
import { SafeAreaView } from "@ui/safe-area-view";

import { Text } from "@ui/text";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

export default function Screen() {
  const { push } = useRouter('/new');

  return (
    <ScrollView
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: TOTAL_TABS_SPACE }}
    >
      <SafeAreaView
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-end",
          paddingHorizontal: 20,
          marginTop: 12
        }}
      >
        <Text.H1 type="alt" color={Colors.primary[200]}>
          Create
        </Text.H1>
        <Pressable>
          <Block
            variant="blur"
            style={{
              borderRadius: 99,
              padding: 10,
            }}
          >
            <Bell size={24} color={Colors.foreground} />
          </Block>
        </Pressable>
      </SafeAreaView>
      <View
        style={{
          marginTop: 20,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 8,
          gap: 8,
        }}
      >
        <Link
          href={ROUTES.SCAN}
          style={{ flex: 1, aspectRatio: 1 }}
        >
          <View style={{
            ...styles.headerButtons,
            borderTopColor: Colors.primary[200],
            backgroundColor: Colors.primary[500],
          }}>
            <ScanLine size={40} color={Colors.primary[900]} />
            <Text.Lg color={Colors.primary[900]}>Scan an item</Text.Lg>
          </View>
        </Link>
        <Pressable
          style={{
            ...styles.headerButtons,
            borderTopColor: Colors.secondary[200],
            backgroundColor: Colors.secondary[500],
          }}
          onPress={() => {
            push(ROUTES.MODALS.NEW_OUTFIT, {
              redirectTo: ROUTES.PROFILE.OUTFITS,
            });
          }}
        >
          <ArrowUpRight size={40} color={Colors.primary[900]} />
          <Text.Lg color={Colors.secondary[900]}>New Outfit</Text.Lg>
        </Pressable>
      </View>
      <View style={{ marginTop: 32 }}>
        <Text.H4 color={Colors.foreground} style={{ marginLeft: 12 }}>
          Trending styles
        </Text.H4>
        <ScrollView
          style={{ marginTop: 16 }}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 36, paddingHorizontal: 16, paddingTop: 6 }}
          contentOffset={{ x: 120, y: 0 }}
        >
          {[
            require('assets/placeholders/can-model.png'),
            require('assets/placeholders/snow-model.png'),
            require('assets/placeholders/restaurant-model.png'),
            require('assets/placeholders/tiger-model.png'),
            require('assets/placeholders/street-model.png'),
          ].map((src, i) => (
            <Collection
              key={i}
              source={src}
              title="Sushi Restaurant"
              style={{ width: 145 }}
            />
          ))}
        </ScrollView>
      </View>
      <View style={{ marginTop: 40 }}>
        <Text.H4 color={Colors.foreground} style={{ marginLeft: 12 }}>
          You next try on
        </Text.H4>
        <ScrollView
          style={{ marginTop: 16 }}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 36, paddingHorizontal: 16, paddingTop: 6 }}
          contentOffset={{ x: 120, y: 0 }}
        >
          {[
            require('assets/placeholders/jeans-outfit.png'),
            require('assets/placeholders/full-outfit.png'),
            require('assets/placeholders/shoes-outfit.png'),
          ].map((src, i) => (
            <Collection
              key={i}
              source={src}
              title="Outfit"
              style={{ width: 156 }}
              contentFit="contain"
            />
          ))}
        </ScrollView>
      </View>
      <Button
        variant="blur"
        onPress={() => router.push('/presets/new')}
        style={{ marginTop: 12 }}
      >
        New preset
      </Button>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  headerButtons: {
    width: '100%',
    height: '100%',
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: 1,
    flex: 1,
    borderTopWidth: 2,
    borderRadius: 32,
    gap: 8
  }
})