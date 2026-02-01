import { cn } from "@ui/utils";
import { Text as NativeText, Platform, StyleSheet, TextStyle } from "react-native";
import { Texts } from "theme";

type Props = {
  className?: string;
  color?: string,
  weight?: 700 | 600 | 500 | 400;
  children?: React.ReactNode;
  style?: TextStyle & {
    textBalance?: boolean;
  };
} & Omit<NativeText['props'], 'style'>;

type PropsExtended = Props & { type?: 'default' | 'alt' }

export const Text = () => {
  return null;
}

const Max = ({ children, color, weight, className, style, ...props }: Props) => {
  const textBreakProps = style?.textBalance ? {
    textBreakStrategy: Platform.OS === 'android' ? 'balanced' as const : undefined,
    lineBreakStrategyIOS: Platform.OS === 'ios' ? 'push-out' as const : undefined,
  } : {};

  const fontWeight = weight ? { fontWeight: weight } : {};

  return (
    <NativeText
      className={cn(className)}
      style={{ ...Texts.max, ...fontWeight, color, ...styles.shared, ...style }}
      {...props}
      {...textBreakProps}
    >
      {children}
    </NativeText>
  )
}

const H1 = ({ children, color, weight, className, style, type, ...props }: PropsExtended & { textBalance?: boolean }) => {
  const styleToApply = type === 'alt' ? Texts.h1.alt : Texts.h1;
  const textBreakProps = style?.textBalance ? {
    textBreakStrategy: Platform.OS === 'android' ? 'balanced' as const : undefined,
    lineBreakStrategyIOS: Platform.OS === 'ios' ? 'push-out' as const : undefined,
  } : {};

  const fontWeight = weight ? { fontWeight: weight } : {};

  return (
    <NativeText
      className={cn(className)}
      style={{ ...styleToApply, ...fontWeight, color, ...styles.shared, ...style }}
      {...props}
      {...textBreakProps}
    >
      {children}
    </NativeText>
  )
}

const H3 = ({ children, color, weight, className, style, type, ...props }: PropsExtended & { textBalance?: boolean }) => {
  const styleToApply = type === 'alt' ? Texts.h3.alt : Texts.h3;
  const textBreakProps = style?.textBalance ? {
    textBreakStrategy: Platform.OS === 'android' ? 'balanced' as const : undefined,
    lineBreakStrategyIOS: Platform.OS === 'ios' ? 'push-out' as const : undefined,
  } : {};

  const fontWeight = weight ? { fontWeight: weight } : {};

  return (
    <NativeText
      className={cn(className)}
      style={{ ...styleToApply, ...fontWeight, color, ...styles.shared, ...style }}
      {...props}
      {...textBreakProps}
    >
      {children}
    </NativeText>
  )
}

const H4 = ({ children, color, weight, className, style, ...props }: Props) => {
  const textBreakProps = style?.textBalance ? {
    textBreakStrategy: Platform.OS === 'android' ? 'balanced' as const : undefined,
    lineBreakStrategyIOS: Platform.OS === 'ios' ? 'push-out' as const : undefined,
  } : {};
  const fontWeight = weight ? { fontWeight: weight } : {};

  return (
    <NativeText
      className={cn(className)}
      style={{ ...Texts.h4, ...fontWeight, color, ...styles.shared, ...style }}
      {...props}
      {...textBreakProps}
    >
      {children}
    </NativeText>
  )
}

const Lg = ({ children, color, weight, className, style, ...props }: Props) => {
  const textBreakProps = style?.textBalance ? {
    textBreakStrategy: Platform.OS === 'android' ? 'balanced' as const : undefined,
    lineBreakStrategyIOS: Platform.OS === 'ios' ? 'push-out' as const : undefined,
  } : {};

  const fontWeight = weight ? { fontWeight: weight } : {};

  return (
    <NativeText
      className={cn(className)}
      style={{ ...Texts.lg, ...fontWeight, color, ...styles.shared, ...style }}
      {...props}
      {...textBreakProps}
    >
      {children}
    </NativeText>
  )
}

const Base = ({ children, color, weight, className, style, ...props }: Props) => {
  const textBreakProps = style?.textBalance ? {
    textBreakStrategy: Platform.OS === 'android' ? 'balanced' as const : undefined,
    lineBreakStrategyIOS: Platform.OS === 'ios' ? 'push-out' as const : undefined,
  } : {};

  const fontWeight = weight ? { fontWeight: weight } : {};

  return (
    <NativeText
      className={cn(className)}
      style={{ ...Texts.base, ...fontWeight, color, ...styles.shared, ...style }}
      {...props}
      {...textBreakProps}
    >
      {children}
    </NativeText>
  )
}

const Sm = ({ children, color, weight, className, style, ...props }: Props) => {
  const textBreakProps = style?.textBalance ? {
    textBreakStrategy: Platform.OS === 'android' ? 'balanced' as const : undefined,
    lineBreakStrategyIOS: Platform.OS === 'ios' ? 'push-out' as const : undefined,
  } : {};

  const fontWeight = weight ? { fontWeight: weight } : {};

  return (
    <NativeText
      className={cn(className)}
      style={{ ...Texts.sm, ...fontWeight, color, ...styles.shared, ...style }}
      {...props}
      {...textBreakProps}
    >
      {children}
    </NativeText>
  )
}

const styles = StyleSheet.create({
  shared: {
    overflow: 'visible',
  }
})

Text.Max = Max;
Text.H1 = H1;
Text.H3 = H3;
Text.H4 = H4;
Text.Lg = Lg;
Text.Base = Base;
Text.Sm = Sm;