import { Block } from '@ui/block';
import { Pressable } from '@ui/pressable';
import { Text } from '@ui/text';
import { ViewStyle } from 'react-native';
import { Colors } from 'theme';

type CategoryProps = {
  icon: React.ComponentType<{ size?: number, color?: string }>;
  title: string;
  borderRadius?: number;
  onPress?: () => void;
  style?: ViewStyle;
  selected?: boolean;
}
export const Category = ({ icon, title, onPress, style, selected, borderRadius = 24 }: CategoryProps) => {
  const Icon = icon;
  return (
    <Pressable
      onPress={onPress}
      style={{ flex: 1, ...style }}
    >
      <Block
        variant={selected ? "primary" : "blur"}
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: 16,
          paddingVertical: 20,
          gap: 8,
          flex: 1,
          borderRadius: borderRadius,
        }}
      >
        <Icon size={24} color={selected ? Colors.primary[900] : Colors.neutral[50]} />
        <Text.Base
          weight={600}
          color={selected ? Colors.primary[900] : Colors.neutral[50]}
        >
          {title}
        </Text.Base>
      </Block>
    </Pressable>
  )
}