import { useRouter } from "@/hooks";
import { useAccount, useAuthActions } from "@/lib/convex/auth";
import { Block } from "@ui/block";
import { Button } from "@ui/button";
import { ArrowLeft, Bell, Camera, ChevronRight, Lock, Package, Settings, TShirt } from "@ui/icons";
import { Image } from "@ui/image";
import { LinearGradient } from "@ui/linear-gradient";
import { ParallaxScrollView } from "@ui/parallax-scroll-view";
import { SafeAreaView } from "@ui/safe-area-view";
import { Text } from "@ui/text";
import { router } from "expo-router";
import { fetchUpdateAsync, reloadAsync, useUpdates } from 'expo-updates';
import { ReactNode } from "react";
import { Linking, Pressable, View, ViewStyle } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

type Props = {
  icon: React.ComponentType<{ size?: number, color?: string }>,
  text: ReactNode,
  style?: ViewStyle,
  onPress?: () => void,
}
const SectionButton = ({ icon, text, style, onPress }: Props) => {
  const Icon = icon;
  return (
    <Pressable
      onPress={onPress}
      style={[{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
      }, style]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Block
          variant="blur"
          style={{ padding: 14 }}>
          <Icon color={Colors.neutral[50]} size={20} />
        </Block>
        <Text.Base color={Colors.neutral[50]} weight={500} numberOfLines={1}>
          {text}
        </Text.Base>
      </View>
      <ChevronRight size={20} color={Colors.neutral[400]} />
    </Pressable>
  )
}

export default function SettingsScreen() {
  const { currentlyRunning, isUpdateAvailable } = useUpdates();

  const { replace, push } = useRouter();
  const { signOut } = useAuthActions();
  const { user, isAdmin } = useAccount();

  if (!user) return null;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ParallaxScrollView
        contentContainerStyle={{ paddingHorizontal: 12 }}
        showsVerticalScrollIndicator={false}
        headerBackground={
          <View style={{ position: 'absolute', width: '100%', left: 0, top: 0, height: 212 }}>
            <Image
              source={user.imageUrl}
              style={{ width: '100%', height: '100%', opacity: 0.3 }}
              blurRadius={3}
            />
            <LinearGradient
              colors={['transparent', Colors.background]}
              style={{ position: 'absolute', width: '100%', left: 0, bottom: 0, height: '50%' }}
            />
          </View>
        }
        headerContent={
          <View style={{ paddingTop: 12 }}>
            <Pressable
              style={{ alignSelf: 'flex-start' }}
              onPress={() => {
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
            <View style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Image
                style={{ width: 72, height: 72, borderRadius: 99, marginBottom: 12 }}
                source={user.imageUrl}
              />
              <Text.Lg weight={500} color={Colors.neutral[50]}>{user.name}</Text.Lg>
              <Text.Base color={Colors.neutral[400]} style={{ marginTop: 4 }}>@{user.username}</Text.Base>
              <Button
                onPress={() => push(ROUTES.EXTRA.AVATAR.PROFILE)}
                variant="primary"
                style={{ marginTop: 20 }}
                align="center"
                endIcon={ChevronRight}
                size="sm"
              >
                Edit profile
              </Button>
            </View>
          </View>
        }
      >

        {isAdmin && <View style={{ marginTop: 36 }}>
          <Text.Sm weight={500} color={Colors.neutral[400]} style={{ marginBottom: 4 }}>Admin</Text.Sm>
          <SectionButton
            icon={Lock}
            text="Access admin panel"
            onPress={() => replace("/admin/bots")}
          />
        </View>}

        <View style={{ marginTop: 24 }}>
          <Text.Sm weight={500} color={Colors.neutral[400]} style={{ marginBottom: 4 }}>Content</Text.Sm>
          <SectionButton
            icon={TShirt}
            text="Saved Outfits"
            onPress={() => push(ROUTES.COLLECTION.SAVED_OUTFITS)}
          />
          <SectionButton
            icon={Camera}
            text="Saved Posts"
            onPress={() => push(ROUTES.COLLECTION.SAVED_POSTS)}
          />
          <SectionButton
            icon={Bell}
            text="Notifications"
            onPress={() => push(ROUTES.EXTRA.NOTIFICATIONS)}
          />
        </View>

        <View style={{ marginTop: 24 }}>
          <Text.Sm weight={500} color={Colors.neutral[400]} style={{ marginBottom: 4 }}>Preferences</Text.Sm>
          <SectionButton
            icon={Bell}
            text="Notifications settings"
            onPress={async () => Linking.openSettings()}
          />
          <SectionButton
            icon={Settings}
            text="Settings"
            onPress={async () => Linking.openSettings()}
          />
        </View>

        <View style={{ marginTop: 24 }}>
          <Text.Sm weight={500} color={Colors.neutral[400]} style={{ marginBottom: 4 }}>More</Text.Sm>
          <SectionButton
            icon={Package}
            text={`${currentlyRunning.runtimeVersion} - ${currentlyRunning.createdAt?.toLocaleDateString() ?? 'X'} - ${isUpdateAvailable ? "Update available" : "Up to date"}`}
            onPress={async () => { await fetchUpdateAsync(); await reloadAsync(); }}
          />
        </View>
        <SafeAreaView edges={{ top: 'off' }} style={{ paddingBottom: 12 }}>
          <Button
            style={{ marginTop: 16 }}
            variant="destructive"
            onPress={() => { signOut(); }}
          >
            Sign out
          </Button>
        </SafeAreaView>
      </ParallaxScrollView>
    </View>
  );
}
