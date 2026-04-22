import { cn } from '@ui/utils';
import { ComponentProps, useMemo } from 'react';
import { ColorValue, View, ViewStyle } from 'react-native';
import { Colors } from 'theme';
import { BLUR_PROPS, BlurView } from './blur-view';
import { LinearGradient } from './linear-gradient';

type Variant = 'primary' | 'secondary' | 'blur' | 'destructive' | 'ghost';

type Props<T extends Variant> = {
  className?: string;
  variant: T;
  style?: ViewStyle;
  children?: React.ReactNode;
  disabled?: boolean;
  blurComponent?: typeof BlurView;
  blurKey?: ComponentProps<typeof BlurView>['blurKey'];
  ref?: React.Ref<View>;
  onLayout?: ComponentProps<typeof BlurView>['onLayout'];
} & (T extends 'blur' ? { blurIntensity?: number } : never)

export const getBlockColors = (variant: Variant, disabled?: boolean) => {
  switch (variant) {
    case 'primary':
      if (disabled) {
        return {
          backgroundColor: Colors.primary[700],
          borderColor: Colors.primary[700],
          textColor: Colors.primary[900],
        };
      }
      return {
        backgroundColor: Colors.primary[500],
        borderColor: Colors.primary[200],
        textColor: Colors.primary[900],
      };
    case 'secondary':
      return {
        backgroundColor: Colors.secondary[500],
        borderColor: Colors.secondary[200],
        textColor: Colors.secondary[900],
      };
    case 'blur':
      return {
        backgroundColor: Colors.blur.dark,
        borderColor: Colors.blur.medium,
        textColor: Colors.neutral[50],
      };
    case 'destructive':
      return {
        backgroundColor: Colors.destructive[500],
        borderColor: 'rgba(255,255,255,0.3)',
        textColor: Colors.destructive[50],
      };
    default:
      return {}
  }
}

const BorderTop = ({ style, disabled, variant }: { style?: ViewStyle, disabled?: boolean, variant: Variant }) => {
  const colors = useMemo(() => getBlockColors(variant, disabled), [disabled, variant]);
  const borderColor = colors.borderColor ?? 'transparent';
  const backgroundColor = variant === "blur" ? 'transparent' : (colors.backgroundColor ?? 'transparent');

  const colorsArray = variant === "blur" ? [backgroundColor, borderColor, borderColor, borderColor, backgroundColor] :
    [backgroundColor, borderColor, backgroundColor] as const;

  return (
    <LinearGradient
      colors={colorsArray as readonly [ColorValue, ColorValue, ...ColorValue[]]}
      start={{ x: 0, y: 0.5 }} // Left center
      end={{ x: 1, y: 0.5 }}   // Right center
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: 1,
        opacity: style?.opacity
      }}
    />
  )
}

export const Block = <T extends Variant>({ className = "", children, variant, style, disabled, blurComponent, blurKey, blurIntensity, onLayout }: Props<T>) => {
  const VariantColors = useMemo(() => getBlockColors(variant, disabled), [disabled, variant]);

  const Component = variant === 'blur' ? (blurComponent ?? BlurView) : View;

  const borderRadius = style?.borderRadius ?? 18;

  const showExtraBorder = (Number(style?.width) || Infinity) > 24 &&
    (Number(borderRadius) || 0) < 99;

  const { padding, paddingLeft, paddingRight, paddingTop, paddingBottom, paddingHorizontal, paddingVertical,
    width, height, aspectRatio,
    flexDirection, justifyContent, alignItems, alignContent, gap, borderColor, borderWidth, ...restStyle } = style || {};

  return (
    <Component
      {...BLUR_PROPS}
      blurKey={blurKey}
      intensity={blurIntensity ?? BLUR_PROPS.intensity}
      style={{
        overflow: 'hidden',
        position: 'relative',
        ...VariantColors,
        borderWidth: 0,
        ...restStyle,
        borderRadius,
        backgroundColor: style?.backgroundColor ?? VariantColors.backgroundColor,
        width: !Number(width) ? width : undefined,
        height: !Number(height) ? height : undefined,
      }}
      className={cn(className)}
      onLayout={onLayout}
    >
      {showExtraBorder && <BorderTop
        style={style}
        disabled={disabled}
        variant={variant}
      />}
      {showExtraBorder && <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.3)', 'transparent']}
        start={{ x: 0, y: 0.5 }} // Left center
        end={{ x: 1, y: 0.5 }}   // Right center
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 3,
          opacity: style?.opacity
        }}
      />}
      {disabled && <View style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: VariantColors.textColor,
        opacity: 0.2
      }} />}
      <View style={[
        {
          padding,
          paddingLeft,
          paddingRight,
          paddingTop,
          paddingBottom,
          paddingHorizontal,
          paddingVertical,
        },
        {
          flexDirection,
          justifyContent,
          alignItems,
          alignContent,
          gap,
        },
        {
          width: width ? (Number(width) ? width : '100%') : undefined,
          height: height ? (Number(height) ? height : '100%') : undefined,
          aspectRatio,
        },
        style?.alignSelf === 'stretch' ? { flex: 1 } : {},
        {
          overflow: 'hidden',
          borderRadius,
          ...VariantColors,
          backgroundColor: 'transparent',
        }, style?.borderColor ? {
          borderColor: style?.borderColor,
          borderWidth: style?.borderWidth ?? undefined,
        } : {
          borderLeftWidth: style?.borderLeftWidth ?? (disabled ? 0 : 1),
          borderRightColor: showExtraBorder ? undefined : 'rgba(0, 0, 0, 0.15)',
          borderRightWidth: showExtraBorder ? 0 : 1,
          borderTopWidth: showExtraBorder ? 1 : 0,
        }]}>
        {children}
      </View>
    </Component>
  )
}