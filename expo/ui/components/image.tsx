import { Image as ExpoImage, ImageProps as ExpoImageProps } from 'expo-image';
import React, { forwardRef, useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export const prefetch = ExpoImage.prefetch;

// Animated wrapper around `expo-image` that fades in when the image loads.
export const Image = forwardRef<any, ImageProps>((props, ref) => {
  const { onLoad, style, ...rest } = props;
  const opacity = useRef(new Animated.Value(0)).current;
  const prevSource = useRef(props.source);

  useEffect(() => {
    // Reset opacity when source changes so the new image can fade in again
    if (prevSource.current !== props.source) {
      opacity.setValue(0);
      prevSource.current = props.source;
    }
  }, [props.source, opacity]);

  const handleLoad: ExpoImageProps['onLoad'] = (e) => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (onLoad) onLoad(e);
  };

  const placeholderSrc = rest.image?.sizes?.thumbnail?.url;

  return (
    <Animated.View style={[style as any, { opacity }]}>
      <ExpoImage
        {...(rest as ExpoImageProps)}
        source={rest.source}
        placeholder={rest.placeholder ?? placeholderSrc}
        ref={ref}
        onLoad={handleLoad}
        cachePolicy={props.cachePolicy ?? 'memory-disk'}
        // Let the inner image inherit the same sizing rules as before
        style={style as any}
      />
    </Animated.View>
  );
});

Image.displayName = 'Image';

export type ImageProps = ExpoImageProps & {
  image?: ImageObject;
}

type ImageSize = {
  width: number;
  height: number;
  url: string;
  hasAlpha?: boolean;
}

export type ImageObject = ImageSize & {
  sizes?: {
    thumbnail: ImageSize;
    small: ImageSize;
    medium: ImageSize;
    large: ImageSize;
    original: ImageSize;
  }
}