import { Block } from '@ui/block';
import { Pressable } from '@ui/pressable';
import { Text } from '@ui/text';
import { ViewStyle } from 'react-native';
import { Colors } from 'theme';

type CategoryProps = {
  icon: React.ComponentType<{ size?: number, color?: string }>;
  title: string;
  category?: string;
  borderRadius?: number;
  onPress?: () => void;
  style?: ViewStyle;
  selected?: boolean;
}
export const Category = ({ icon, title, onPress, style, selected, category, borderRadius = 24 }: CategoryProps) => {
  const Icon = icon;
  return (
    <Pressable
      disabled={!onPress}
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
          flex: 1,
          borderRadius: borderRadius,
        }}
      >
        <Icon size={24} color={selected ? Colors.primary[900] : Colors.neutral[50]} />
        <Text.Base
          weight={600}
          color={selected ? Colors.primary[900] : Colors.neutral[50]}
          style={{ marginTop: 8 }}
        >
          {title.charAt(0).toUpperCase() + title.slice(1).toLowerCase()}
        </Text.Base>
        {category && <Text.Sm
          color={Colors.neutral[400]}
          style={{ marginTop: 4 }}
        >
          {category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()}
        </Text.Sm>}
      </Block>
    </Pressable>
  )
}