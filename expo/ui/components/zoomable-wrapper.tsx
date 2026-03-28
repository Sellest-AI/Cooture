import { Platform, View } from "react-native";
import { SnapbackZoom } from "react-native-zoom-toolkit";

type ZoomableWrapperProps = {
  children: React.ReactNode;
  onPinchChange?: (pinching: boolean) => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
};

export const ZoomableWrapper = ({
  children,
  onPinchChange,
  onTap,
  onDoubleTap,
  onLongPress,
}: ZoomableWrapperProps) => {
  if (Platform.OS === 'web') {
    return (
      <View>
        {children}
      </View>
    )
  }

  return (
    <SnapbackZoom
      onPinchStart={() => { onPinchChange?.(true); }}
      onPinchEnd={() => { onPinchChange?.(false); }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      onTap={() => { onTap?.(); }}
      onDoubleTap={() => { onDoubleTap?.(); }}
      onLongPress={() => { onLongPress?.(); }}
      longPressDuration={251}
    >
      {children}
    </SnapbackZoom>
  );
};

