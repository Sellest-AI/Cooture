import { ComponentProps, useEffect, useRef, useState } from 'react';
import { TextInput as NativeTextInput, View, ViewStyle } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { Colors } from 'theme';
import { BlurView } from './blur-view';
import { X } from './icons';
import { Pressable } from './pressable';

type Props = {
  className?: string;
  style?: ViewStyle;
  autoFocus?: boolean;
  startIcon?: React.ComponentType<{ size?: number, color?: string, style?: SvgProps['style'] }>;
  canClear?: boolean;
  onBlur?: (value: string) => void;
} & Omit<ComponentProps<typeof NativeTextInput>, 'style' | 'onBlur'>;

export const TextInput = ({ className = "", style, startIcon, canClear, autoFocus, ...props }: Props) => {
  const hasIcon = !!startIcon;
  const Icon = startIcon;

  const [value, setValue] = useState(props.value?.toString() ?? '');
  useEffect(() => { setValue(props.value?.toString() ?? '') }, [props.value]);

  const hasText = value.length > 0;

  const ref = useRef<View>(null);

  // Force re-render on mount to get the correct width of the component
  const [, setInit] = useState(false);

  const refWidth = (ref.current as unknown as View)?.clientWidth ?? 0;
  const textWidth = refWidth - (hasIcon ? 52 : 24) - (canClear && hasText ? 52 : 0);

  return (
    <BlurView
      ref={ref}
      onLayout={() => setInit(true)}
      style={{
        borderRadius: 20,
        backgroundColor: Colors.blur.dark,
        borderColor: Colors.blur.medium,
        borderTopWidth: 1,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: (canClear && hasText) ? 'space-between' : 'flex-start',
        paddingLeft: hasIcon ? 20 : 0,
        paddingRight: (canClear && hasText) ? 12 : 0,
        height: 52,
        ...style,
      }}
    >
      {Icon && <View style={{ marginRight: 12 }}>
        <Icon
          size={20}
          color={Colors.neutral[200]}
        />
      </View>}
      <NativeTextInput
        {...props}
        value={value}
        onChangeText={(text) => {
          setValue(text);
          props.onChangeText?.(text);
        }}
        onBlur={(e) => {
          if (!props.onBlur) return;
          const _value = (e.nativeEvent as unknown as { text: string }).text ??
            e.currentTarget.nodeValue ?? value ?? props.value ?? '';
          setValue(_value.toString());
          props.onBlur?.(_value);
        }}
        autoFocus={autoFocus}
        onLayout={autoFocus ? (e) => e.currentTarget.focus() : undefined}
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
        onPress={() => {
          setValue('');
          if (props.onBlur) props.onBlur('')
          else props.onChangeText?.('')
        }}
        style={{ marginLeft: 4, paddingLeft: 8, paddingVertical: 8, paddingRight: 8 }}
      >
        <X
          size={20}
          color={Colors.neutral[200]}
        />
      </Pressable>}
    </BlurView>
  )
}