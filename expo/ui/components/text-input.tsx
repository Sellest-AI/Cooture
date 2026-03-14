import { ComponentProps, useRef } from 'react';
import { TextInput as NativeTextInput, View, ViewStyle } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { Colors } from 'theme';
import { X } from './icons';
import { Pressable } from './pressable';

type Props = {
  className?: string;
  style?: ViewStyle;
  focusOnLayout?: boolean;
  startIcon?: React.ComponentType<{ size?: number, color?: string, style?: SvgProps['style'] }>;
  canClear?: boolean;
} & ComponentProps<typeof NativeTextInput>;

export const TextInput = ({ className = "", style, startIcon, canClear, focusOnLayout, ...props }: Props) => {
  const hasIcon = !!startIcon;
  const Icon = startIcon;

  const hasText = props.value && props.value.toString().length > 0;

  const ref = useRef<View>(null);

  const refWidth = ref.current?.clientWidth ?? 0;
  const textWidth = refWidth - (hasIcon ? 52 : 24) - (canClear && hasText ? 52 : 0);

  return (
    <View
      ref={ref}
      style={[{
        borderRadius: 16,
        backgroundColor: Colors.blur.dark,
        borderTopColor: Colors.blur.medium,
        color: Colors.foreground,
        borderTopWidth: 1,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: canClear && hasText ? 'space-between' : 'flex-start',
        paddingLeft: hasIcon ? 20 : 0,
        paddingRight: canClear && hasText ? 20 : 0,
        height: 52,
      }, style]}
    >
      {Icon && <View style={{ marginRight: 12 }}>
        <Icon
          size={20}
          color={Colors.neutral[200]}
        />
      </View>}
      <NativeTextInput
        {...props}
        onLayout={focusOnLayout ? (e) => e.currentTarget.focus() : undefined}
        placeholderTextColor={Colors.neutral[400]}
        className="focus:border-none focus:ring-0 focus:outline-none"
        style={[{
          height: 52,
          paddingLeft: hasIcon ? 0 : 24,
          paddingRight: 24,
          color: Colors.neutral[50],
          borderColor: 'transparent',
          backgroundColor: 'transparent',
          width: refWidth > 0 ? textWidth : '100%',
        }]}
      />
      {canClear && <Pressable
        onPress={() => { props.onChangeText?.(''); }}
        style={{ marginLeft: 12 }}
      >
        <X
          size={20}
          color={Colors.neutral[200]}
        />
      </Pressable>}
    </View>
  )
}