import { ComponentProps } from 'react';
import { TextInput as NativeTextInput, View, ViewStyle } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { Colors } from 'theme';

type Props = {
  className?: string;
  style?: ViewStyle;
  startIcon?: React.ComponentType<{ size?: number, color?: string, style?: SvgProps['style'] }>;
} & ComponentProps<typeof NativeTextInput>;

export const TextInput = ({ className = "", style, startIcon, ...props }: Props) => {
  const hasIcon = !!startIcon;
  const Icon = startIcon;

  return (
    <View style={[{
      borderRadius: 16,
      backgroundColor: Colors.blur.dark,
      borderTopColor: Colors.blur.medium,
      color: Colors.foreground,
      borderTopWidth: 1,
      overflow: 'hidden',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingLeft: hasIcon ? 20 : 0,
      height: 52,
    }, style]}
    >
      {Icon && <Icon
        size={20}
        color={Colors.neutral[200]}
        style={{
          marginRight: 12,
        }}
      />}
      <NativeTextInput
        {...props}
        placeholderTextColor={Colors.neutral[400]}
        className="focus:border-none focus:ring-0 focus:outline-none"
        style={[{
          height: 52,
          paddingLeft: hasIcon ? 0 : 24,
          paddingRight: 24,
          color: Colors.neutral[50],
          borderColor: 'transparent',
          backgroundColor: 'transparent',
          width: '100%',
        }]}
      />
    </View>
  )
}