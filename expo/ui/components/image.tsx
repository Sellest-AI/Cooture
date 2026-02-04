import { Image as ExpoImage, ImageProps as ExpoImageProps } from 'expo-image';
import React, { forwardRef, useEffect, useRef } from 'react';
import { Animated } from 'react-native';

// Animated wrapper around `expo-image` that fades in when the image loads.
export const Image = forwardRef<any, ExpoImageProps>((props, ref) => {
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

  return (
    <Animated.View style={[style as any, { opacity }]}>
      <ExpoImage
        {...(rest as ExpoImageProps)}
        ref={ref}
        onLoad={handleLoad}
        // Let the inner image inherit the same sizing rules as before
        style={style as any}
      />
    </Animated.View>
  );
});

Image.displayName = 'Image';

export type ImageProps = ExpoImageProps; 