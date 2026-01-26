import { cn } from '@ui/utils';
import { useMemo } from 'react';
import { View, ViewStyle } from 'react-native';
import { Colors } from 'theme';
import { BLUR_PROPS, BlurView } from './blur-view';
import { LinearGradient } from './linear-gradient';

type Props = {
  className?: string;
  variant: 'primary' | 'secondary' | 'blur' | 'destructive';
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const getBlockColors = (variant: Props['variant']) => {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: Colors.primary[500],
        borderLeftColor: Colors.primary[200],
        borderTopColor: Colors.primary[200],
        textColor: Colors.primary[900],
      };
    case 'secondary':
      return {
        backgroundColor: Colors.blur.dark,
        borderLeftColor: Colors.blur.medium,
        borderTopColor: Colors.blur.medium,
        textColor: Colors.neutral[50],
      };
    case 'blur':
      return {
        backgroundColor: Colors.blur.dark,
        borderLeftColor: Colors.blur.medium,
        borderTopColor: Colors.blur.medium,
        textColor: Colors.neutral[50],
      };
    case 'destructive':
      return {
        backgroundColor: Colors.destructive[500],
        borderLeftColor: 'rgba(255,255,255,0.3)',
        borderTopColor: 'rgba(255,255,255,0.3)',
        textColor: Colors.destructive[50],
      };
    default:
      return {}
  }
}

export const Block = ({ className = "", children, variant, style }: Props) => {
  const VariantColors = useMemo(() => getBlockColors(variant), [variant]);

  const Component = variant === 'blur' ? BlurView : View;

  const showTopBorder = (Number(style?.width) || Infinity) > 24 &&
    (Number(style?.borderRadius) || 0) < 99;

  return (
    <Component
      {...BLUR_PROPS}
      style={[{
        overflow: 'hidden',
        position: 'relative',
        ...VariantColors,
        borderTopWidth: 1,
        borderLeftWidth: 2,
        borderRadius: 18,
      }, style]}
      className={cn(className)}
    >
      {showTopBorder && <LinearGradient
        colors={[VariantColors.borderTopColor ?? 'transparent', VariantColors.borderTopColor ?? 'transparent', VariantColors.borderTopColor ?? 'transparent', 'transparent']}
        start={{ x: 0, y: 0.5 }} // Left center
        end={{ x: 1, y: 0.5 }}   // Right center
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 1
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
          height: 3
        }}
      />
      {children}
    </Component>
  )
}