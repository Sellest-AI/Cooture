import { FlashListRef } from "@shopify/flash-list"
import { LinearGradient } from "@ui/linear-gradient"
import { SafeAreaView } from "@ui/safe-area-view"
import { Tabs } from "@ui/tabs"
import React, { ReactNode, useEffect, useState } from "react"
import { Animated, View } from "react-native"
import { Colors } from "theme"

type Props = {
  children: ReactNode;
  tabs: { label: string; value: string }[];
  tab: string;
  onChangeTab?: (tab: string) => void;
  scrollValue?: Animated.Value;
  scrollRef?: React.RefObject<FlashListRef<any> | null>;
}

export const SharedWrapper = ({ tab, tabs, children, scrollValue, scrollRef, onChangeTab }: Props) => {
  const [savedScroll, setSavedScroll] = useState<{ tab: string, offset: number }[]>([]);

  useEffect(() => {
    if (!scrollValue) return;
    const listener = scrollValue.addListener(({ value }) => {
      setSavedScroll((prev) => prev.filter(s => s.tab !== tab).concat({
        tab,
        offset: value
      }))
    })
    return () => scrollValue?.removeListener(listener);
  }, [scrollValue, tab])

  return (
    <View style={{
      flex: 1,
      paddingHorizontal: tab === tabs[0]?.value ? 0 : 12,
    }}>
      {children}
      <Animated.View style={{
        position: 'absolute',
        inset: 0,
        height: 100,
        pointerEvents: 'none',
        opacity: scrollValue?.interpolate({
          inputRange: [0, 30],
          outputRange: [0, 1],
          extrapolate: 'clamp',
        }),
      }}>
        <LinearGradient
          colors={[Colors.background, 'transparent']}
          style={{ height: 48 }}
        />
      </Animated.View>
      <SafeAreaView style={{
        position: 'absolute',
        bottom: 16,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
      }}
        edges={{ bottom: 'android' }}
      >
        <Tabs
          activeTab={tab}
          onTabChange={(newTab) => {
            if (tab === newTab) {
              scrollRef?.current?.scrollToOffset({ offset: 0, animated: true });
              return;
            }

            onChangeTab?.(newTab);
            const saved = savedScroll.find(s => s.tab === newTab);
            const offset = saved ? saved.offset : 0;
            requestAnimationFrame(() => {
              scrollRef?.current?.scrollToOffset({ offset, animated: false });
            })
          }}
          tabs={tabs}
        />
      </SafeAreaView>
    </View>
  )
}