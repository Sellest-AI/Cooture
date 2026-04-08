import { useRouter } from "@/hooks";
import { Id } from "@/lib/convex/client";
import { useScrollToTop } from "@react-navigation/native";
import { Block } from "@ui/block";
import { BlurKeys } from "@ui/blur-view";
import { Credits, Settings, ShareIcon } from "@ui/icons";
import { Image } from "@ui/image";
import { ModalHeader } from "@ui/modal";
import { ParallaxScrollView } from "@ui/parallax-scroll-view";
import { Pressable } from "@ui/pressable";
import { SafeAreaView } from "@ui/safe-area-view";
import { StickyView } from "@ui/sticky-view";
import { Tabs } from "@ui/tabs";
import { Text } from "@ui/text";
import { Href, router, Slot, useSegments } from "expo-router";
import { WEBSITE } from "global";
import { usePostHog } from "posthog-react-native";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { LayoutRectangle, PanResponder, Platform, ScrollView, Share, View, ViewStyle } from "react-native";
import { ROUTES } from "routes";
import { Colors } from "theme";
import { WaitlistBlock } from "../waitlist/waitlist-block";
import { FollowersFollowing } from "./followers-following";

const TABS = ['generations', 'outfits', 'items'] as const;

type Props = {
  user?: null | {
    username?: string;
    name?: string;
    _id: Id<'users'>;
    _creationTime: number;
    isPremium?: boolean;
  }
  isSelf?: boolean;
  recentPosts?: {
    _id: Id<'predictions'>;
    image: {
      url: string
      sizes: { thumbnail: { url: string }, large: { url: string } };
    }
  }[],
  style?: ViewStyle;
}

export function Screen({ user, isSelf, recentPosts, style }: Props) {
  const posthog = usePostHog();
  const { back, push } = useRouter(ROUTES.USER.PATH);
  const { pathname: path } = useRouter.Path();
  const slotRef = useRef<LayoutRectangle | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);

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
    const newPath = path.toString()
      .replaceAll('/generations', '/[tabs]')
      .replaceAll('/outfits', '/[tabs]')
      .replaceAll('/items', '/[tabs]')
      .replaceAll('[tabs]', tab)

    router.replace(newPath as Href);
    // Scroll to the beginning of the slot content
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: 500,
        animated: true
      });
    }, 1000);
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

  const showRecentPosts = isSelf && recentPosts && recentPosts.length > 3;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={{ top: 'off', bottom: 'android' }}>
      <ParallaxScrollView
        ref={scrollRef}
        contentNegativeSpace={56}
        headerBackgroundImagePosition="top center"
        headerBackgroundImage={recentPosts?.[0]?.image?.sizes.large.url ?? require('assets/backgrounds/dark-gradient.png')}
        contentContainerStyle={style}
        headerContent={
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              paddingLeft: !isSelf ? 12 : 20,
              paddingRight: 12,
              height: 286
            }}
          >
            <ModalHeader
              style={{ width: '100%' }}
              onBack={isSelf ? undefined : () => back()}
              title="Profile"
              type="alt"
              size="big"
              endContent={<View style={{ flexDirection: 'row', gap: 8 }}>
                {/* <Notification /> */}
                <Pressable onPress={() => {                  // if (!isSelf) push(ROUTES.PHOTOSHOOT.NEW, { params: { userId: user._id } })
                  posthog.capture('profile_share_button_pressed', { userId: user._id, isSelf: isSelf || false });
                  const url = WEBSITE.URL + ROUTES.SHARE.USER(user._id);
                  const message = isSelf ? `Check out my profile on Cooture!` :
                    `Check out this user on Cooture!`;
                  Share.share(Platform.OS === 'ios' ? { url, message: message } :
                    { title: message, message: url })
                }}>
                  <Block
                    variant="blur"
                    style={{
                      borderRadius: 99,
                      padding: 12,
                    }}
                  >
                    <ShareIcon size={22} color={Colors.foreground} />
                  </Block>
                </Pressable>
                {isSelf && <Pressable onPress={() => {
                  if (isSelf) return push(ROUTES.PROFILE.SETTINGS);
                  // if (!isSelf) push(ROUTES.PHOTOSHOOT.NEW, { params: { userId: user._id } })
                }}>
                  <Block
                    variant="blur"
                    style={{
                      borderRadius: 99,
                      padding: 10,
                    }}
                  >
                    {isSelf && <Settings size={24} color={Colors.foreground} />}
                    {/* {!isSelf && <Camera size={24} color={Colors.foreground} />} */}
                  </Block>
                </Pressable>}
              </View>}
            />
          </View>
        }
      >
        <View style={{ paddingHorizontal: 20 }}>
          {user.username && <Text.Lg color={Colors.neutral[200]} weight={500} style={{ marginBottom: 2 }}>
            @{user.username}
          </Text.Lg>}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text.H3 color={Colors.foreground} numberOfLines={1}>{user.name}</Text.H3>
              {user.isPremium && <Credits size={18} />}
            </View>
            <Text.Base color={Colors.neutral[400]} weight={600} >
              Since {new Date(user._creationTime).getFullYear()}
            </Text.Base>
          </View>
        </View>
        <View style={{ paddingHorizontal: 8, gap: 8, marginTop: 16 }}>
          <FollowersFollowing userId={user._id} />
          {showRecentPosts && <Block
            variant="blur"
            style={{
              borderRadius: 28,
              flexDirection: "row",
              gap: 8,
              padding: 12
            }}
          >
            {recentPosts?.slice(0, 4).toReversed().map((item, i, arr) => {
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
          {isSelf && <WaitlistBlock
            style={{ marginBottom: 24 }}
          />}
          <StickyView
            topOffset={Platform.OS === 'web' ? -48 : -12}
            style={{ marginBottom: 24, marginTop: showRecentPosts ? 0 : 24 }}
            onLayout={(e) => {
              slotRef.current = e.nativeEvent.layout;
            }}
          >
            <Tabs
              blurKey={BlurKeys.PROFILE_TABS}
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
            <ProfilePageContext.Provider value={{ userId: user._id }}>
              <Slot />
            </ProfilePageContext.Provider>
          </View>
        </View>
      </ParallaxScrollView>
    </SafeAreaView>
  );
}

export const ProfilePageContext = createContext<{ userId: Id<'users'> } | null>(null);

export const useProfileContext = () => {
  const context = useContext(ProfilePageContext);
  if (!context) {
    throw new Error('useProfileContext must be used within a ProfilePageContext.Provider');
  }
  return context;
};

