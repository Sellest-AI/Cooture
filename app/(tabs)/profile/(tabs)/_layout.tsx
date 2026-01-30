import { useAccount } from "@/lib/convex/auth";
import { QuickActions } from "@/modules/profiles/quick-actions";
import { TOTAL_TABS_SPACE } from "@/modules/tabs";
import { Block } from "@ui/block";
import { ArrowUpRight, Bell, Gem, Settings } from "@ui/icons";
import { Image } from "@ui/image";
import { ParallaxScrollView } from "@ui/parallax-scroll-view";
import { StickyView } from "@ui/sticky-view";
import { Tabs } from "@ui/tabs";
import { Text } from "@ui/text";
import { router, Slot, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

export const unstable_settings = {
  initialRouteName: 'outfits',
};

const TABS = ['generations', 'outfits', 'items'] as const;

export default function TabsLayout() {
  const { user } = useAccount();

  const segments = useSegments();
  const currentRoute = segments[segments.length - 1] as typeof TABS[number];
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>(currentRoute ?? 'outfits');

  useEffect(() => {
    if (currentRoute && currentRoute !== activeTab) {
      setActiveTab(currentRoute);
    }
  }, [activeTab, currentRoute]);

  const handleTabChange = (tab: typeof TABS[number]) => {
    setActiveTab(tab);
    router.push(`/profile/${tab}`);
  };

  if (!user) return null;

  return (
    <ParallaxScrollView
      headerHeight={372}
      headerSpace={120}
      headerBackgroundImage={require('assets/placeholders/home-model.png')}
      contentContainerStyle={{ paddingBottom: TOTAL_TABS_SPACE }}
      headerContent={
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
            paddingLeft: 20,
            paddingRight: 12,
            marginTop: 16
          }}
        >
          <Text.H1 type="alt" color={Colors.primary[200]}>
            Profile
          </Text.H1>
          <View style={{ flexDirection: 'row', gap: 8 }}>
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
              <Block
                variant="destructive"
                style={{
                  position: "absolute",
                  top: 2,
                  left: -8,
                  borderRadius: 99,
                  width: 24,
                  height: 24,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text.Sm color={Colors.destructive[50]} weight={700}>2</Text.Sm>
              </Block>
            </Pressable>
            <Pressable onPress={() => router.push(ROUTES.PROFILE.SETTINGS)}>
              <Block
                variant="blur"
                style={{
                  borderRadius: 99,
                  padding: 10,
                }}
              >
                <Settings size={24} color={Colors.foreground} />
              </Block>
            </Pressable>
          </View>
        </View>
      }
    >
      <View style={{ paddingHorizontal: 20 }}>
        <Text.H3 color={Colors.foreground}>
          {user.name}
        </Text.H3>
        <Text.Base color={Colors.neutral[400]} weight={600} style={{ marginTop: 2 }}>
          Since {new Date(user._creationTime).getFullYear()}
        </Text.Base>
      </View>
      <View style={{ paddingHorizontal: 8, gap: 8, marginTop: 16 }}>
        <QuickActions />
        <Block
          variant="blur"
          style={{
            borderRadius: 28,
            flexDirection: "row",
            gap: 8,
            padding: 12
          }}
        >
          {[
            require('assets/placeholders/street-model.png'),
            require('assets/placeholders/can-model.png'),
            require('assets/placeholders/snow-model.png'),
            require('assets/placeholders/home-model.png'),
          ].map((src, i, arr) => {
            const isLast = i === arr.length - 1;
            return (
              <View
                key={i}
                style={{
                  flex: 1,
                  aspectRatio: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderTopWidth: 2,
                  borderColor: Colors.blur.medium,
                  borderRadius: 20,
                  overflow: 'hidden'
                }}
              >
                <Image
                  source={src}
                  blurRadius={isLast ? Platform.OS === 'android' ? 30 : 2 : 0}
                  style={{
                    flex: 1,
                    aspectRatio: 1,
                    opacity: isLast ? 0.3 : 1,
                  }}
                />
                {isLast && <Text.Sm
                  weight={700}
                  style={{
                    position: 'absolute',
                    color: Colors.foreground,
                    textAlign: 'center',
                    width: '50%',
                  }}
                >
                  See more
                </Text.Sm>}
              </View>
            )
          })}
        </Block>
        <Block
          variant="blur"
          style={{
            marginBottom: 32,
            borderRadius: 28,
            paddingHorizontal: 12,
            paddingVertical: 10,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Block
            variant="primary"
            style={{
              width: 68,
              aspectRatio: 1,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 22,
            }}
          >
            <Gem size={28} color={Colors.primary[900]} />
          </Block>
          <View style={{ flex: 1, paddingHorizontal: 12, gap: 6 }}>
            <Text.Lg
              color={Colors.primary[500]}
              numberOfLines={1}
            >
              Unlock unlimited generations
            </Text.Lg>
            <View style={{
              flexDirection: "row",
              alignItems: "flex-end",
              gap: 8,
            }}>
              <Text.Sm
                color={Colors.primary[200]}
                numberOfLines={2}
                style={{ flex: 1, overflow: 'visible' }}
              >
                Upgrade your plan and unlock more generations.
              </Text.Sm>
              <ArrowUpRight
                color={Colors.primary[200]}
                size={24}
              />
            </View>
          </View>
        </Block>
        <StickyView
          topOffset={Platform.OS === 'web' ? -48 : -12}
          style={{ marginBottom: 24 }}
        >
          <Tabs
            tabs={[
              { label: 'Outfits', value: 'outfits' },
              { label: 'Generations', value: 'generations' },
              { label: 'Items', value: 'items' },
            ]}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </StickyView>
        <Slot />
      </View>
    </ParallaxScrollView>
  );
}
