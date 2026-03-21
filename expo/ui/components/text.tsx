import { cn } from "@ui/utils";
import { Platform, StyleSheet, Text as TextNative, TextStyle, View } from "react-native";
import { Texts } from "theme";

type Props = {
  className?: string;
  color?: string,
  weight?: 700 | 600 | 500 | 400;
  children?: React.ReactNode;
  style?: TextStyle & {
    textBalance?: boolean;
  };
} & Omit<TextNative['props'], 'style'>;

type PropsExtended = Props & { type?: 'default' | 'alt' }

const NativeText = ({ ...props }: TextNative['props']) => {
  if (Platform.OS === 'web') return <TextNative {...props} />;

  const style = StyleSheet.flatten(props.style);

  const spaceLeft = style?.paddingLeft || style?.paddingHorizontal || style?.paddingInlineStart || style?.marginLeft || style?.marginHorizontal || style?.marginInlineStart;
  const spaceRight = style?.paddingRight || style?.paddingHorizontal || style?.paddingInlineEnd || style?.marginRight || style?.marginHorizontal || style?.marginInlineEnd;

  const hasSpace = spaceLeft || spaceRight;

  if (hasSpace) {
    return <>
      {spaceLeft && <View style={{ width: spaceLeft }} />}
      <TextNative {...props} />
      {spaceRight && <View style={{ width: spaceRight }} />}
    </>
  }

  return <TextNative {...props} />
}

export const Text = () => {
  return null;
}

const Max = ({ children, color, weight, className, style, ...props }: Props) => {
  const textBreakProps = style?.textBalance ? {
    textBreakStrategy: 'balanced' as const,
    lineBreakStrategyIOS: Platform.OS === 'ios' ? 'push-out' as const : undefined,
  } : {};

  const fontWeight = weight ? { fontWeight: weight } : {};
  const overflow = props.numberOfLines ? 'hidden' : undefined;
  const paddingRight = 2 + (Number(style?.padding || style?.paddingRight) || 0);

  return (
    <NativeText
      className={cn(className)}
      style={{ ...Texts.max, ...fontWeight, color, ...styles.shared, overflow, paddingRight, ...style }}
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
    textBreakStrategy: 'balanced' as const,
    lineBreakStrategyIOS: Platform.OS === 'ios' ? 'push-out' as const : undefined,
  } : {};

  const fontWeight = weight ? { fontWeight: weight } : {};
  const overflow = props.numberOfLines ? 'hidden' : undefined;
  const paddingRight = 2 + (Number(style?.padding || style?.paddingRight) || 0);

  return (
    <NativeText
      className={cn(className)}
      style={{ ...styleToApply, ...fontWeight, color, ...styles.shared, overflow, paddingRight, ...style }}
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
    textBreakStrategy: 'balanced' as const,
    lineBreakStrategyIOS: Platform.OS === 'ios' ? 'push-out' as const : undefined,
  } : {};

  const fontWeight = weight ? { fontWeight: weight } : {};
  const overflow = props.numberOfLines ? 'hidden' : undefined;
  const paddingRight = 1 + (Number(style?.padding || style?.paddingRight) || 0);

  return (
    <NativeText
      className={cn(className)}
      style={{ ...styleToApply, ...fontWeight, color, ...styles.shared, overflow, paddingRight, ...style }}
      {...props}
      {...textBreakProps}
    >
      {children}
    </NativeText>
  )
}

const H4 = ({ children, color, weight, className, style, ...props }: Props) => {
  const textBreakProps = style?.textBalance ? {
    textBreakStrategy: 'balanced' as const,
    lineBreakStrategyIOS: Platform.OS === 'ios' ? 'push-out' as const : undefined,
  } : {};
  const fontWeight = weight ? { fontWeight: weight } : {};
  const overflow = props.numberOfLines ? 'hidden' : undefined;

  return (
    <NativeText
      className={cn(className)}
      style={{ ...Texts.h4, ...fontWeight, color, ...styles.shared, overflow, ...style }}
      {...props}
      {...textBreakProps}
    >
      {children}
    </NativeText>
  )
}

const Lg = ({ children, color, weight, className, style, ...props }: Props) => {
  const textBreakProps = style?.textBalance ? {
    textBreakStrategy: 'balanced' as const,
    lineBreakStrategyIOS: Platform.OS === 'ios' ? 'push-out' as const : undefined,
  } : {};

  const fontWeight = weight ? { fontWeight: weight } : {};
  const overflow = props.numberOfLines ? 'hidden' : undefined;

  return (
    <NativeText
      className={cn(className)}
      style={{ ...Texts.lg, ...fontWeight, color, ...styles.shared, overflow, ...style }}
      {...props}
      {...textBreakProps}
    >
      {children}
    </NativeText>
  )
}

const Base = ({ children, color, weight, className, style, ...props }: Props) => {
  const textBreakProps = style?.textBalance ? {
    textBreakStrategy: 'balanced' as const,
    lineBreakStrategyIOS: Platform.OS === 'ios' ? 'push-out' as const : undefined,
  } : {};

  const fontWeight = weight ? { fontWeight: weight } : {};
  const overflow = props.numberOfLines ? 'hidden' : undefined;

  return (
    <NativeText
      className={cn(className)}
      style={{ ...Texts.base, ...fontWeight, color, ...styles.shared, overflow, ...style }}
      {...props}
      {...textBreakProps}
    >
      {children}
    </NativeText>
  )
}

const Sm = ({ children, color, weight, className, style, ...props }: Props) => {
  const textBreakProps = style?.textBalance ? {
    textBreakStrategy: 'balanced' as const,
    lineBreakStrategyIOS: Platform.OS === 'ios' ? 'push-out' as const : undefined,
  } : {};

  const fontWeight = weight ? { fontWeight: weight } : {};
  const overflow = props.numberOfLines ? 'hidden' : undefined;

  return (
    <NativeText
      className={cn(className)}
      style={{ ...Texts.sm, ...fontWeight, color, ...styles.shared, overflow, ...style }}
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