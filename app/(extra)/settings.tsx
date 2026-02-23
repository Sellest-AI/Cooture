import { useAuthActions } from "@/lib/convex/auth";
import { TOTAL_TABS_SPACE } from "@/modules/tabs";
import { Block } from "@ui/block";
import { Button } from "@ui/button";
import { ArrowLeft } from "@ui/icons";
import { Text } from "@ui/text";
import { router } from "expo-router";
import { fetchUpdateAsync, reloadAsync, useUpdates } from 'expo-updates';
import { Pressable, ScrollView, View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

export default function SettingsScreen() {
  const { signOut } = useAuthActions();

  const { currentlyRunning, isUpdateAvailable } = useUpdates();

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: TOTAL_TABS_SPACE + 20 }}
    >
      <View style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 24 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <Pressable onPress={() => {
            if (router.canGoBack()) { router.back() }
            else router.replace(ROUTES.PROFILE.PATH);
          }}>
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

        <Button
          variant="blur"
          onPress={() => {
            router.push('/admin/bots');
          }}
        >
          Admin
        </Button>

        <Button
          variant="destructive"
          onPress={() => {
            signOut();
          }}
        >
          Sign out
        </Button>

        <Button
          style={{ marginTop: 34 }}
          variant="blur"
          onPress={async () => {
            await fetchUpdateAsync();
            await reloadAsync();
          }}
        >
          Update
        </Button>

        <Text.Base color={Colors.neutral[400]} style={{ marginTop: 4 }}>
          {currentlyRunning.runtimeVersion} - {currentlyRunning.createdAt?.toLocaleDateString()} - {isUpdateAvailable ? "Update available" : "App is up to date"}
        </Text.Base>
      </View>
    </ScrollView>
  );
}
