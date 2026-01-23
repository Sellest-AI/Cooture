import { TOTAL_TABS_SPACE } from "@/modules/tabs";
import { Block } from "@ui/block";
import { ArrowLeft } from "@ui/icons";
import { Text } from "@ui/text";
import { router } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { Colors } from "theme";

export default function SettingsScreen() {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: TOTAL_TABS_SPACE + 20 }}
    >
      <View style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 24 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <Pressable onPress={() => router.back()}>
            <Block
              variant="blur"
              style={{
                borderRadius: 99,
                padding: 10,
              }}
            >
              <ArrowLeft size={24} color={Colors.foreground} />
            </Block>
          </Pressable>
          <Text.H3 color={Colors.foreground}>
            Settings
          </Text.H3>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        <Block
          variant="blur"
          style={{
            borderRadius: 28,
            padding: 16,
          }}
        >
          <Text.Lg color={Colors.foreground}>
            Account Settings
          </Text.Lg>
          <Text.Base color={Colors.neutral[400]} style={{ marginTop: 4 }}>
            Manage your account preferences
          </Text.Base>
        </Block>

        <Block
          variant="blur"
          style={{
            borderRadius: 28,
            padding: 16,
          }}
        >
          <Text.Lg color={Colors.foreground}>
            Privacy
          </Text.Lg>
          <Text.Base color={Colors.neutral[400]} style={{ marginTop: 4 }}>
            Control your privacy settings
          </Text.Base>
        </Block>

        <Block
          variant="blur"
          style={{
            borderRadius: 28,
            padding: 16,
          }}
        >
          <Text.Lg color={Colors.foreground}>
            Notifications
          </Text.Lg>
          <Text.Base color={Colors.neutral[400]} style={{ marginTop: 4 }}>
            Manage notification preferences
          </Text.Base>
        </Block>
      </View>
    </ScrollView>
  );
}
