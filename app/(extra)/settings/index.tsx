import { useRouter } from "@/hooks";
import { useAccount, useAuthActions } from "@/lib/convex/auth";
import { Block } from "@ui/block";
import { Button } from "@ui/button";
import { ArrowLeft, Bell, Camera, ChevronRight, Credits, Gem, Lock, Package, Settings, TriangleAlert, TShirt } from "@ui/icons";
import { Image } from "@ui/image";
import { LinearGradient } from "@ui/linear-gradient";
import { MenuGroup, MenuItem } from "@ui/menu";
import { ParallaxScrollView } from "@ui/parallax-scroll-view";
import { SafeAreaView } from "@ui/safe-area-view";
import { Text } from "@ui/text";
import { router } from "expo-router";
import { fetchUpdateAsync, reloadAsync, useUpdates } from 'expo-updates';
import { Linking, Platform, Pressable, View } from "react-native";
import Purchases from "react-native-purchases";
import { ROUTES } from "routes";
import { Colors } from "theme";

export default function Screen() {
  const { currentlyRunning, isUpdateAvailable } = useUpdates();

  const { replace, push } = useRouter();
  const { signOut } = useAuthActions();
  const { user, isPremium } = useAccount();
  const { isAdmin } = useAccount.Admin();

  const manageSubscription = async () => {
    if (isPremium) await Purchases.showManageSubscriptions();
    else await push(ROUTES.MODALS.UPGRADE);
  }

  if (!user) return null;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ParallaxScrollView
        contentContainerStyle={{ paddingHorizontal: 12 }}
        showsVerticalScrollIndicator={false}
        headerBackground={
          <View style={{ position: 'absolute', width: '100%', left: 0, top: 0, height: 212 }}>
            <Image
              source={user.image}
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
          <View style={{ paddingTop: Platform.OS !== 'ios' ? 12 : 0 }}>
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
                source={user.image}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text.Lg weight={500} color={Colors.neutral[50]}>{user.name}</Text.Lg>
                {isPremium && <Credits size={14} />}
              </View>
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

        {isAdmin && <MenuGroup title="Admin" style={{ marginTop: 36 }}>
          <MenuItem
            icon={Lock}
            text="Access admin panel"
            onPress={() => replace("/admin/bots")}
          />
        </MenuGroup>}

        <MenuGroup title="Content">
          <MenuItem
            icon={TShirt}
            text="Saved Outfits"
            onPress={() => push(ROUTES.COLLECTION.SAVED_OUTFITS)}
          />
          <MenuItem
            icon={Camera}
            text="Saved Posts"
            onPress={() => push(ROUTES.COLLECTION.SAVED_POSTS)}
          />
          <MenuItem
            icon={Bell}
            text="Notifications"
            onPress={() => push(ROUTES.EXTRA.NOTIFICATIONS)}
          />
        </MenuGroup>

        <MenuGroup title="Preferences">
          <MenuItem
            icon={Bell}
            text="Notifications settings"
            onPress={async () => Linking.openSettings()}
          />
          <MenuItem
            icon={Settings}
            text="Settings"
            onPress={async () => Linking.openSettings()}
          />
        </MenuGroup>

        <MenuGroup title="Account">
          <MenuItem
            icon={Gem}
            text="Manage subscription"
            onPress={async () => await manageSubscription()}
          />
          <MenuItem
            icon={TriangleAlert}
            text="Delete account"
            // onPress={async () => Linking.openURL(WEBSITE.HELP.DELETE_ACCOUNT)}
            onPress={async () => push('/settings/delete-account')}
          />
        </MenuGroup>

        <MenuGroup title="System">
          <MenuItem
            icon={Package}
            text={`${currentlyRunning.runtimeVersion} - ${currentlyRunning.createdAt?.toLocaleDateString() ?? 'X'} - ${isUpdateAvailable ? "Update available" : "Up to date"}`}
            onPress={async () => { await fetchUpdateAsync(); await reloadAsync(); }}
          />
        </MenuGroup>

        <SafeAreaView edges={{ top: 'off', bottom: 'android' }} style={{ paddingBottom: 12 }}>
          <Button
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
