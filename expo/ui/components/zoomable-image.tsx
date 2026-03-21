import { Platform } from "react-native";
import { SnapbackZoom } from "react-native-zoom-toolkit";
import { Image, ImageProps } from './image';

type ZoomableImageProps = {
  source: string | undefined;
  contentFit?: 'cover' | 'contain';
  cachePolicy?: ImageProps['cachePolicy'];
  style?: ImageProps['style'];
  width: number;
  aspectRatio?: number;
  onPinchChange?: (pinching: boolean) => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
};

export const ZoomableImage = ({
  source,
  contentFit = 'cover',
  cachePolicy,
  style,
  width,
  aspectRatio = 1,
  onPinchChange,
  onTap,
  onDoubleTap,
  onLongPress,
}: ZoomableImageProps) => {
  if (Platform.OS === 'web') {
    return (
      <Image
        source={source}
        contentFit={contentFit}
        style={[style, {
          width,
          height: width / aspectRatio,
        }]}
      />
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
    >
      <Image
        source={source}
        contentFit={contentFit}
        cachePolicy={cachePolicy}
        style={[style, {
          width,
          height: width / aspectRatio,
        }]}
      />
    </SnapbackZoom>
  );
};

