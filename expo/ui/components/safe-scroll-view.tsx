import { EdgeModeExtended, KeyboardAvoidingView, SafeAreaView, useSafeAreaInsets } from '@ui/safe-area-view';
import { ComponentProps } from 'react';
import { Platform, ScrollView, ViewStyle } from "react-native";

export { useSafeAreaInsets } from 'react-native-safe-area-context';

type Edges = {
  top?: EdgeModeExtended | 'padding',
  bottom?: EdgeModeExtended,
  left?: EdgeModeExtended,
  right?: EdgeModeExtended,
}

type Props = {
  style?: ViewStyle,
  onReachEnd?: () => void,
  edges?: Edges;
  ref?: React.Ref<ScrollView>;
} & Omit<ComponentProps<typeof ScrollView>, 'style' | 'ref'>;

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
      <SafeAreaView
        style={{ flex: Platform.OS === 'web' ? 1 : style?.flex }}
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
            paddingBottom: contentPaddingBottom ?? Math.max(fallbackPadding * 2, 0),
            minHeight: style?.minHeight ?? (style?.flex === 1 ? '100%' : undefined),
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
    </KeyboardAvoidingView>
  )
}