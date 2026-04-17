import { ComponentProps } from "react"
import { ViewStyle } from "react-native"
import { Colors } from "theme"
import { Pressable } from "./pressable"
import { Text } from "./text"

type IconStyle = ViewStyle & { strokeWidth?: number }

type Props = {
  startIcon?: React.ComponentType<{ size?: number, color?: string, style?: IconStyle }> | false;
  children: string;
  style?: ViewStyle;
  onPress?: ComponentProps<typeof Pressable>["onPress"];
  disabled?: boolean;
  variant: "primary" | "destructive";
}

export const ButtonGhost = ({ children, style, onPress, disabled, variant, ...rest }: Props) => {
  const StartIcon = rest.startIcon;

  return (
    <Pressable
      disabled={disabled}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        ...style,
      }}
    >
      {StartIcon && <StartIcon size={16} color={variant === "destructive" ? Colors.destructive[500] : Colors.primary[500]} />}
      <Text.Base color={Colors.neutral[400]} weight={500}>{children}</Text.Base>
    </Pressable>
  )
}