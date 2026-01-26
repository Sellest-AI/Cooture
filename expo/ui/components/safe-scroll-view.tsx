import { KeyboardAvoidingView, SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from '@ui/safe-area-view';
import { ComponentProps } from 'react';
import { Platform, ScrollView, ViewStyle } from "react-native";

type Props = {
  style: ViewStyle,
} & Omit<ComponentProps<typeof ScrollView>, 'style'>;

export const SafeScrollView = ({ style, children, contentContainerStyle, ...props }: Props) => {
  const insets = useSafeAreaInsets();

  const fallbackPadding =
    Platform.OS === 'web' ? 0 :
      Number(style.padding ?? style.paddingBottom ?? 0);

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
              paddingBottom: Math.max(fallbackPadding * 2, insets.bottom),
            }]}
          >
            {children}
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </KeyboardAvoidingView>
  )
}