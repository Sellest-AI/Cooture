import { KeyboardAvoidingView, SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from '@ui/safe-area-view';
import { ComponentProps } from 'react';
import { Platform, ScrollView, ViewStyle } from "react-native";

type Props = {
  style?: ViewStyle,
  onReachEnd?: () => void,
} & Omit<ComponentProps<typeof ScrollView>, 'style'>;

export const SafeScrollView = ({ style, children, contentContainerStyle, onReachEnd, ...props }: Props) => {
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
        <SafeAreaView>
          <ScrollView
            {...props}
            style={{ ...style }}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[contentContainerStyle, {
              paddingBottom: contentPaddingBottom ?? Math.max(fallbackPadding * 2, insets.bottom),
            }]}
            scrollEventThrottle={400}
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