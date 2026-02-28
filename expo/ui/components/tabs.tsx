import { useEffect, useState } from "react";
import { LayoutChangeEvent, Pressable, ViewStyle } from "react-native";
import { Colors } from "theme";
import { Block } from "./block";
import { BlurKeys } from "./blur-view";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "./motion";
import { Text } from "./text";

type Tab<T extends string> = {
  label: string;
  value: T;
};

type Props<T extends string> = {
  tabs: Tab<T>[];
  activeTab?: T;
  onTabChange?: (value: T) => void;
  style?: ViewStyle;
  blurKey?: BlurKeys;
};

export const Tabs = <T extends string>({ tabs, activeTab: controlledActiveTab, onTabChange, style, blurKey }: Props<T>) => {
  const [activeTab, setActiveTab] = useState(controlledActiveTab || tabs[0]?.value || '');
  const [tabLayouts, setTabLayouts] = useState<{ [key: string]: { x: number; width: number } }>({});

  const translateX = useSharedValue(0);
  const width = useSharedValue(0);

  const PADDING = 8;

  const currentActiveTab = controlledActiveTab !== undefined ? controlledActiveTab : activeTab;

  useEffect(() => {
    const layout = tabLayouts[currentActiveTab];
    if (layout) {
      translateX.value = withSpring(layout.x, {
        damping: 90,
        stiffness: 1000,
      });
      width.value = withSpring(layout.width, {
        damping: 90,
        stiffness: 1000,
      });
    }
  }, [currentActiveTab, tabLayouts, translateX, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: width.value,
  }));

  const handleTabPress = (value: string) => {
    if (controlledActiveTab === undefined) {
      setActiveTab(value);
    }
    onTabChange?.(value as T);
  };

  const handleLayout = (value: string) => (event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setTabLayouts(prev => ({
      ...prev,
      [value]: { x, width },
    }));
  };

  return (
    <Block
      variant="blur"
      blurKey={blurKey}
      style={{
        flexDirection: "row",
        width: 'auto',
        marginHorizontal: 'auto',
        borderRadius: 99,
        padding: PADDING,
        paddingRight: PADDING + 4,
        position: "relative",
        ...style,
      }}
    >
      {/* Animated background indicator */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: PADDING,
            bottom: PADDING,
            borderRadius: 99,
            backgroundColor: Colors.blur.medium,
            borderColor: Colors.blur.light,
            borderLeftWidth: 1,
            borderTopWidth: 1,
          },
          animatedStyle,
        ]}
      />
      {/* Tabs */}
      {tabs.map((tab) => {
        const isActive = currentActiveTab === tab.value;
        return (
          <Pressable
            key={tab.value}
            onPress={() => handleTabPress(tab.value)}
            onLayout={handleLayout(tab.value)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 20,
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
            }}
          >
            <Text.Base
              weight={600}
              color={isActive ? Colors.foreground : Colors.neutral[400]}
            >
              {tab.label}
            </Text.Base>
          </Pressable>
        );
      })}
    </Block>
  );
};
