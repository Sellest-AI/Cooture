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
};

export const ZoomableImage = ({
  source,
  contentFit = 'cover',
  cachePolicy,
  style,
  width,
  aspectRatio = 1,
  onPinchChange,
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
    // Simple use case
    <SnapbackZoom
      onPinchStart={() => { onPinchChange?.(true); }}
      onPinchEnd={() => { onPinchChange?.(false); }}
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

