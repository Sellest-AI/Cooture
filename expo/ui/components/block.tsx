import { cn } from '@ui/utils';
import { useMemo } from 'react';
import { View, ViewStyle } from 'react-native';
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

export const Block = ({ className = "", children, variant, style, disabled, blurComponent }: Props) => {
  const VariantColors = useMemo(() => getBlockColors(variant, disabled), [disabled, variant]);

  const Component = variant === 'blur' ? (blurComponent ?? BlurView) : View;

  const showTopBorder = (Number(style?.width) || Infinity) > 24 &&
    (Number(style?.borderRadius) || 0) < 99;

  return (
    <Component
      {...BLUR_PROPS}
      style={[{
        overflow: 'hidden',
        position: 'relative',
        ...VariantColors,
        borderTopWidth: disabled ? 0 : 1,
        borderLeftWidth: disabled ? 0 : 2,
        borderRadius: 18,
      }, {
        ...style,
        backgroundColor: style?.backgroundColor ?? VariantColors.backgroundColor,
      }]}
      className={cn(className)}
    >
      {showTopBorder && <LinearGradient
        colors={[VariantColors.borderColor ?? 'transparent', VariantColors.borderColor ?? 'transparent', VariantColors.borderColor ?? 'transparent', 'transparent']}
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