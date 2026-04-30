import { ROUTES, useRoute } from "@/hooks";
import { useAccount } from "@/lib/convex/auth";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Block } from "@ui/block";
import { Bot, ChartPie, Users } from "@ui/icons";
import { SafeAreaView } from "@ui/safe-area-view";
import { Redirect, Tabs } from "expo-router";
import { AnimatePresence, MotiView } from "moti";
import { Pressable, StyleSheet } from "react-native";
import { Colors } from "theme";

export const unstable_settings = {
  initialRouteName: 'statistics',
};

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { pathname } = useRoute.Path();

  const showTabBar = !pathname.includes('/bots/');

  return (
    <AnimatePresence>
      {showTabBar && <MotiView
        exit={{ translateY: 100 }}
        from={{ translateY: 100 }}
        animate={{ translateY: 0 }}
      >
        <SafeAreaView style={styles.tabBarContainer} edges={{ top: 'off', bottom: 'android' }}>
          <Block
            variant="blur"
            style={styles.tabBar}
          // blurComponent={BlurView}
          >
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const isFocused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              const color = isFocused ? Colors.primary[500] : Colors.neutral[50];
              const size = 24;

              const iconContent = options.tabBarIcon?.({ focused: isFocused, color, size });

              return (
                <Pressable
                  key={route.key}
                  style={styles.tabItem}
                  onPress={onPress}
                >
                  {iconContent}
                </Pressable>
              );
            })}
          </Block>
        </SafeAreaView>
      </MotiView>}
    </AnimatePresence>
  );
}

export default function TabsLayout() {
  const { isAdmin } = useAccount.Admin();

  if (!isAdmin) return (
    <Redirect href={ROUTES.TABS.FEED} />
  )

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: Colors.background,
        }
      }}
    >
      <Tabs.Screen
        name="statistics"
        options={{
          tabBarIcon: ({ color, size }) => <ChartPie color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="bots"
        options={{
          tabBarIcon: ({ color, size }) => <Bot color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 99,
    height: 64,
    maxWidth: 356,
    paddingHorizontal: 8,
    width: 'auto',
    overflow: 'hidden',
  },
  tabItem: {
    width: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

