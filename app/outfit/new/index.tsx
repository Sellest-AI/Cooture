import { ROUTES, useRouter } from "@/hooks";
import { Block } from "@ui/block";
import { Globe, ScanLine, Search } from "@ui/icons";
import { ModalHeader } from "@ui/modal";
import { Pressable } from "@ui/pressable";
import { SafeAreaView } from "@ui/safe-area-view";
import { Text } from "@ui/text";
import { router } from "expo-router";
import { MotiView } from "moti";
import { StyleSheet, View } from "react-native";
import { Colors } from "theme";

export default function Screen() {
  const { push, replace } = useRouter();

  return (
    <SafeAreaView style={{
      padding: 8,
      flex: 1,
    }}>
      <ModalHeader
        onBack={router.canGoBack() ? () => router.back() : undefined}
        title="New outfit"
        subtitle="Choose a source for your clothes"
        type="alt"
      />
      <View style={{
        marginTop: 8,
        alignItems: 'flex-end',
        flex: 1,
        gap: 8,
      }}>
        <MotiView
          style={{ flex: 1 }}
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 100 }}
        >
          <Pressable
            style={{ width: '100%', flex: 1 }}
            onPress={() => { replace(ROUTES.SCAN); }}
          >
            <Block variant="blur" style={{
              ...styles.buttons,
            }}>
              <ScanLine size={40} color={Colors.neutral[50]} />
              <Text.Lg color={Colors.neutral[50]} style={{ textAlign: 'center', marginBottom: 4 }}>
                Scan an item
              </Text.Lg>
              <Text.Base color={Colors.neutral[400]} weight={500} style={{ textAlign: 'center' }}>
                Import your clothes directly from your camera or photo library
              </Text.Base>
            </Block>
          </Pressable>
        </MotiView>
        <MotiView
          style={{ flex: 1 }}
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 300 }}
        >
          <Pressable
            style={{
              ...styles.buttons,
              borderTopColor: Colors.primary[200],
              backgroundColor: Colors.primary[500],
            }}
            onPress={() => {
              push(ROUTES.MODALS.NEW_OUTFIT, {
                redirectTo: ROUTES.PROFILE.OUTFITS,
              });
            }}
          >
            <Search size={40} color={Colors.primary[900]} />
            <Text.Lg color={Colors.primary[900]} style={{ textAlign: 'center', marginBottom: 4 }}>
              From closet
            </Text.Lg>
            <Text.Base color={Colors.primary[700]} weight={500} style={{ textAlign: 'center' }}>
              Browse directly from your closet and in our database.
            </Text.Base>
          </Pressable>
        </MotiView>
        <MotiView
          style={{ flex: 1 }}
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 500 }}
        >
          <Pressable
            style={{
              ...styles.buttons,
              borderTopColor: Colors.secondary[200],
              backgroundColor: Colors.secondary[500],
            }}
            onPress={() => { replace(ROUTES.OUTFIT.BROWSER); }}
          >
            <Globe size={40} color={Colors.secondary[900]} />
            <Text.Lg color={Colors.secondary[900]} style={{ textAlign: 'center', marginBottom: 4 }}>
              Browse online
            </Text.Lg>
            <Text.Base color={Colors.secondary[700]} weight={500} style={{ textAlign: 'center' }}>
              Search items on your favorite stores and import them to your closet.
            </Text.Base>
          </Pressable>
        </MotiView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  buttons: {
    width: '100%',
    height: '100%',
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: 56,
    paddingVertical: 48,
    borderTopWidth: 2,
    borderRadius: 32,
    gap: 8
  }
})