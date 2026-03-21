import { cn } from '@ui/utils';
import { ComponentProps, useMemo } from 'react';
import { ColorValue, View, ViewStyle } from 'react-native';
import { Colors } from 'theme';
import { BLUR_PROPS, BlurView } from './blur-view';
import { LinearGradient } from './linear-gradient';

type Props = {
  className?: string;
  variant: 'primary' | 'secondary' | 'blur' | 'destructive' | 'ghost';
  style?: ViewStyle;
  children?: React.ReactNode;
  disabled?: boolean;
  blurComponent?: typeof BlurView;
  blurKey?: ComponentProps<typeof BlurView>['blurKey'];
}

export const getBlockColors = (variant: Props['variant'], disabled?: boolean) => {
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

const BorderTop = ({ style, disabled, variant }: { style?: ViewStyle, disabled?: boolean, variant: Props['variant'] }) => {
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
        height: 1.5,
        opacity: style?.opacity
      }}
    />
  )
}

export const Block = ({ className = "", children, variant, style, disabled, blurComponent, blurKey }: Props) => {
  const VariantColors = useMemo(() => getBlockColors(variant, disabled), [disabled, variant]);

  const Component = variant === 'blur' ? (blurComponent ?? BlurView) : View;

  const showTopBorder = (Number(style?.width) || Infinity) > 24 &&
    (Number(style?.borderRadius) || 0) < 99;

  return (
    <Component
      {...BLUR_PROPS}
      blurKey={blurKey}
      style={{
        overflow: 'hidden',
        position: 'relative',
        ...VariantColors,
        borderLeftWidth: disabled ? 0 : 2,
        borderRadius: 18,
        ...style,
        backgroundColor: style?.backgroundColor ?? VariantColors.backgroundColor,
      }}
      className={cn(className)}
    >
      {showTopBorder && <BorderTop
        style={style}
        disabled={disabled}
        variant={variant}
      />}
      <LinearGradient
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
      />
      {disabled && <View style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: VariantColors.textColor,
        opacity: 0.2
      }} />}
      {children}
    </Component>
  )
}