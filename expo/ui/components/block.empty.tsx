import { View, ViewStyle } from 'react-native';
import { Colors } from 'theme';
import { Button } from './button';
import { Text } from './text';

type Props = {
  style?: ViewStyle,
  variant?: 'primary' | 'secondary';
  icon?: React.ComponentType<{ size?: number, color?: string, style?: ViewStyle }> | false;
  title: string;
  description: string;
  cta?: false | {
    onPress: () => void;
    label: string;
  }
}

export const EmptyBlock = ({ style, icon, title, description, cta, variant = 'primary' }: Props) => {
  const Icon = icon;

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        paddingHorizontal: 28,
        minHeight: style?.height,
        ...style,
      }}
    >
      {Icon && <Icon
        color={variant === 'primary' ? Colors.primary[500] : Colors.secondary[500]}
        size={40}
      />}
      <Text.H3 color={Colors.neutral[50]} style={{
        textAlign: 'center',
        marginTop: 20,
        width: '90%',
      }}>
        {title}
      </Text.H3>
      <Text.Base color={Colors.neutral[400]}
        textBreakStrategy="balanced"
        style={{
          textAlign: 'center',
          marginTop: 12,
        }}>
        {description}
      </Text.Base>
      {cta && <Button
        variant={variant}
        onPress={cta.onPress}
        style={{ marginTop: 48 }}
      >
        {cta.label}
      </Button>}
    </View>
  )
}