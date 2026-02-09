import { useAccount } from "@/lib/convex/auth";
import { api, usePaginatedQueryCached } from "@/lib/convex/client";
import { PremiumBlock } from "@/modules/premium/premium-block";
import { Notification } from "@/modules/profiles/notification";
import { QuickActions } from "@/modules/profiles/quick-actions";
import { TOTAL_TABS_SPACE } from "@/modules/tabs";
import { Block } from "@ui/block";
import { Settings } from "@ui/icons";
import { Image } from "@ui/image";
import { ParallaxScrollView } from "@ui/parallax-scroll-view";
import { Pressable } from "@ui/pressable";
import { SafeAreaView } from "@ui/safe-area-view";
import { StickyView } from "@ui/sticky-view";
import { Tabs } from "@ui/tabs";
import { Text } from "@ui/text";
import { router, Slot, useSegments } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Dimensions, LayoutRectangle, PanResponder, Platform, ScrollView, View } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";

export const unstable_settings = {
  initialRouteName: 'outfits',
};

const TABS = ['generations', 'outfits', 'items'] as const;

export default function TabsLayout() {
  const _generations = usePaginatedQueryCached(api.router.generations.getPaginated.authed, {}, { initialNumItems: 4 });
  const { user } = useAccount();
  const scrollRef = useRef<ScrollView>(null);
  const slotRef = useRef<LayoutRectangle | null>(null);

  const segments = useSegments();
  const currentRoute = segments[segments.length - 1] as typeof TABS[number];
  const [activeTab, _setActiveTab] = useState<typeof TABS[number]>(currentRoute ?? 'outfits');
  const activeTabRef = useRef(activeTab);

  const setActiveTab = (tab: typeof TABS[number]) => {
    activeTabRef.current = tab;
    _setActiveTab(tab);
  }

  useEffect(() => {
    if (currentRoute && currentRoute !== activeTab) {
      setActiveTab(currentRoute);
    }
  }, [activeTab, currentRoute]);

  const handleTabChange = (tab: typeof TABS[number]) => {
    setActiveTab(tab);
    router.push(`/profile/${tab}`);
    // Scroll to the beginning of the slot content
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: Dimensions.get('window').height - 32,
        animated: true
      });
    }, 100);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderRelease: (_, gestureState) => {
        const SWIPE_THRESHOLD = 50;
        const currentIndex = TABS.indexOf(activeTabRef.current);

        if (gestureState.dx > SWIPE_THRESHOLD) {
          const nextIndex = (currentIndex - 1) < 0 ? TABS.length - 1 : currentIndex - 1;
          handleTabChange(TABS[nextIndex]);
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          const nextIndex = (currentIndex + 1) >= TABS.length ? 0 : currentIndex + 1;
          handleTabChange(TABS[nextIndex]);
        }
      },
    })
  ).current;

  if (!user) return null;

  const generations = (_generations.results ?? []).filter((g) => g.cover);
  const previewGenerations = generations.map((g) => g.predictions).flat().filter((p) => p.status === 'ACCEPTED');

  return (
    <SafeAreaView style={{ flex: 1 }} edges={{ top: 'off' }}>
      <ParallaxScrollView
        ref={scrollRef}
        contentNegativeSpace={56}
        headerBackgroundImagePosition="top center"
        headerBackgroundImage={previewGenerations[0]?.image?.url ?? require('assets/backgrounds/dark-gradient.png')}
        contentContainerStyle={{ paddingBottom: TOTAL_TABS_SPACE }}
        headerContent={
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              paddingLeft: 20,
              paddingRight: 12,
              marginTop: 12,
              height: 286
            }}
          >
            <Text.H1 type="alt" color={Colors.primary[200]}>
              Profile
            </Text.H1>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Notification />
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
          {previewGenerations.length > 3 && <Block
            variant="blur"
            style={{
              borderRadius: 28,
              flexDirection: "row",
              gap: 8,
              padding: 12
            }}
          >
            {previewGenerations.slice(0, 4).toReversed().map((item, i, arr) => {
              const isLast = i === arr.length - 1;
              return (
                <Pressable
                  key={i}
                  style={{ flex: 1, aspectRatio: 1 }}
                  onPress={() => {
                    if (!isLast) router.push(ROUTES.POST.ID(item._id));
                    else handleTabChange('generations');
                  }}
                >
                  <View style={{
                    flex: 1,
                    aspectRatio: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderTopWidth: 2,
                    borderColor: Colors.blur.medium,
                    borderRadius: 16,
                    overflow: 'hidden'
                  }}>
                    <Image
                      source={item.image?.sizes.thumbnail.url}
                      blurRadius={isLast ? 3 : 0}
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
                </Pressable>
              )
            })}
          </Block>}
          <PremiumBlock
            style={{ marginBottom: 32 }}
          />
          <StickyView
            topOffset={Platform.OS === 'web' ? -48 : -12}
            style={{ marginBottom: 24 }}
            onLayout={(e) => {
              slotRef.current = e.nativeEvent.layout;
            }}
          >
            <Tabs
              tabs={[
                { label: 'Generations', value: 'generations' },
                { label: 'Outfits', value: 'outfits' },
                { label: 'Items', value: 'items' },
              ]}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </StickyView>
          <View {...panResponder.panHandlers}>
            <Slot />
          </View>
        </View>
      </ParallaxScrollView>
    </SafeAreaView>
  );
}
