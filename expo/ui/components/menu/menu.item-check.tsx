import { CheckCircle, Circle } from "lucide-react-native";
import { ReactNode, useState } from "react";
import { View, ViewStyle } from "react-native";
import { Colors } from "theme";
import { Block } from "../block";
import { Loader } from "../icons";
import { Pressable } from "../pressable";
import { Text } from "../text";

type Props = {
  variant?: 'primary' | 'secondary' | 'destructive',
  icon: React.ComponentType<{ size?: number, color?: string, weight?: 'regular' | 'fill' }>,
  iconWeight?: 'regular' | 'fill',
  text: ReactNode,
  style?: ViewStyle,
  onPress?: (() => Promise<void>) | (() => void),
  disabled?: boolean,
  selected?: boolean,
}
export const MenuItemCheck = ({ icon, text, style, onPress, selected, disabled, iconWeight, variant = 'primary' }: Props) => {
  const [loading, setLoading] = useState(false);
  const Icon = loading ? Loader : icon;

  const RightIcon = selected ? CheckCircle : Circle;

  const colors = () => {
    const color = selected ? variant : "default";

    switch (color) {
      case "primary":
        return {
          variant: "primary",
          background: Colors.primary[500],
          icon: Colors.primary[900],
          iconDisabled: Colors.primary[700],
          color: Colors.primary[500],
          chevronOpacity: 0.7,
        }
      case "secondary":
        return {
          variant: "secondary",
          background: Colors.secondary[500],
          icon: Colors.secondary[900],
          iconDisabled: Colors.secondary[700],
          color: Colors.secondary[500],
          chevronOpacity: 0.7,
        }
      case "destructive":
        return {
          variant: "destructive",
          background: Colors.destructive[500],
          icon: Colors.destructive[50],
          iconDisabled: Colors.destructive[50],
          color: Colors.destructive[500],
          chevronOpacity: 0.7,
        }
      default:
        return {
          variant: "blur",
          background: Colors.blur.dark,
          icon: Colors.neutral[50],
          iconDisabled: Colors.neutral[400],
          color: Colors.neutral[50],
          chevronOpacity: 0.7,
        }
    }
  }

  const theme = colors();

  return (
    <Pressable
      onPress={async () => {
        setLoading(true);
        try { await onPress?.(); }
        finally { setLoading(false); }
      }}
      intensity={0.99}
      disabled={disabled}
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        opacity: disabled ? 0.5 : style?.opacity,
        ...style,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Block
          variant={!selected ? "blur" : (variant ?? "blur")}
          style={{ padding: 14 }}
        >
          <Icon
            color={disabled ? theme.iconDisabled : theme.icon}
            weight={iconWeight}
            size={20}
          />
        </Block>
        <Text.Base
          color={theme.color}
          weight={500}
          numberOfLines={1}
        >
          {text}
        </Text.Base>
      </View>
      <RightIcon
        size={20}
        color={theme.color}
        style={{ opacity: theme.chevronOpacity, marginRight: 8 }}
      />
    </Pressable>
  )
}
