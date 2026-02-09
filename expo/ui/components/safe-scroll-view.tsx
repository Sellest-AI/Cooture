import { KeyboardAvoidingView, SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from '@ui/safe-area-view';
import { ComponentProps } from 'react';
import { Platform, ScrollView, ViewStyle } from "react-native";
import { EdgeMode } from 'react-native-safe-area-context';

export { useSafeAreaInsets } from 'react-native-safe-area-context';

type Edges = {
  top?: EdgeMode | 'padding',
  bottom?: EdgeMode,
  left?: EdgeMode,
  right?: EdgeMode,
}

type Props = {
  style?: ViewStyle,
  onReachEnd?: () => void,
  edges?: Edges;
} & Omit<ComponentProps<typeof ScrollView>, 'style'>;

export const SafeScrollView = ({ style, children, contentContainerStyle, onReachEnd, edges, showsVerticalScrollIndicator = false, ...props }: Props) => {
  const insets = useSafeAreaInsets();

  const fallbackPadding =
    Platform.OS === 'web' ? 0 :
      Number(style?.paddingBottom ?? style?.padding ?? 0);

  const contentPaddingBottom = (contentContainerStyle as ViewStyle)?.paddingBottom;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={insets.top + fallbackPadding}
    >
      <SafeAreaProvider>
        <SafeAreaView
          edges={{
            top: edges?.top === 'padding' ? 'off' : (edges?.top ?? 'additive'),
            left: edges?.left ?? 'additive',
            right: edges?.right ?? 'additive',
            bottom: edges?.bottom ?? 'additive',
          }}
        >
          <ScrollView
            {...props}
            style={{
              ...style,
              paddingTop: edges?.top === 'padding' ?
                (insets.top + (Number(style?.paddingTop) || 0)) : style?.paddingTop
            }}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[contentContainerStyle, {
              paddingBottom: contentPaddingBottom ?? Math.max(fallbackPadding * 2, insets.bottom),
            }]}
            scrollEventThrottle={400}
            showsVerticalScrollIndicator={showsVerticalScrollIndicator}
            onScroll={(e) => {
              const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
              const paddingToBottom = 120;
              const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

              if (isCloseToBottom) { onReachEnd?.(); }
            }}
          >
            {children}
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </KeyboardAvoidingView>
  )
}