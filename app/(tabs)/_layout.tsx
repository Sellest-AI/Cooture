import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Block } from "@ui/block";
import { BlurKeys } from "@ui/blur-view";
import { BookmarkIcon, Compass, Home, Plus, User } from "@ui/icons";
import { SafeAreaView } from "@ui/safe-area-view";
import { Tabs } from "expo-router";
import { useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { Colors } from "theme";

export const unstable_settings = {
  initialRouteName: 'feed',
};

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 12,
    }).start();
  };

  const blurKey = state.index === 0 ? BlurKeys.FEED :
    state.index === 1 ? BlurKeys.EXPLORE :
      state.index === 2 ? BlurKeys.NEW :
        state.index === 3 ? BlurKeys.COLLECTION :
          state.index === 4 ? BlurKeys.PROFILE : undefined;
  return (
    <SafeAreaView style={styles.tabBarContainer} edges={{ top: 'off' }}>
      <Block
        blurKey={blurKey}
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
          const isCenterButton = route.name === 'new';

          const iconContent = options.tabBarIcon?.({ focused: isFocused, color, size });

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={isCenterButton ? styles.centerTabItem : styles.tabItem}
              onPressIn={isCenterButton ? handlePressIn : undefined}
              onPressOut={isCenterButton ? handlePressOut : undefined}
            >
              {isCenterButton ? (
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  {iconContent}
                </Animated.View>
              ) : (
                iconContent
              )}
            </Pressable>
          );
        })}
      </Block>
    </SafeAreaView>
  );
}

export default function TabsLayout() {
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
        name="feed"
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="new"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              paddingHorizontal: 32,
              paddingTop: 8,
              paddingVertical: 12,
              borderRadius: 99,
              backgroundColor: Colors.primary[500],
              borderTopColor: Colors.primary[200],
              borderTopWidth: 4,
            }}>
              <Plus color={Colors.neutral[900]} size={24} strokeWidth={3} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          tabBarIcon: ({ color, size }) => <BookmarkIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
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
    width: '95%',
    overflow: 'hidden',
  },
  tabItem: {
    width: 58,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerTabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

