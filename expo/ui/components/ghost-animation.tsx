import { useState } from "react";
import { Platform, Pressable, ViewStyle } from "react-native";
import { MotiView } from "./motion";

type GhostAnimationProps = {
  selected?: boolean;
  size: number;
  onPress?: () => void;
  icon: React.ComponentType<{ size?: number, color?: string, style?: ViewStyle, weight?: 'fill' | undefined }>;
  color?: string;
  style?: ViewStyle;
}
export const GhostIconWrapper = ({ icon: Icon, selected, size, color, onPress, style }: GhostAnimationProps) => {
  const [isAnimating, setAnimating] = useState(false);
  const [scale, setScale] = useState(2);

  return (
    <Pressable
      style={{ ...style }}
      onPress={() => {
        onPress?.();
        requestAnimationFrame(() => setAnimating(true));
        setScale(selected ? 0 : 2);
      }}
    >
      <Icon
        color={color}
        weight={selected ? 'fill' : undefined}
        size={size}
      />
      {isAnimating && (
        <MotiView
          key={scale}
          onDidAnimate={() => setAnimating(false)}
          from={{ scale: 1, opacity: scale === 0 ? 0.4 : 1 }}
          animate={{ scale, opacity: 0 }}
          transition={{ type: 'timing', duration: 400 }}
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            top: Platform.OS === 'web' ? 0 : (style?.padding ?? 0),
            left: Platform.OS === 'web' ? 0 : (style?.padding ?? 0),
          }}
        >
          <Icon
            color={color}
            weight={'fill'}
            size={size}
          />
        </MotiView>
      )}
    </Pressable>
  )
}
