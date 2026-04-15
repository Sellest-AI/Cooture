import { Image as ExpoImage, ImageProps as ExpoImageProps } from 'expo-image';
import React, { forwardRef } from 'react';

export const prefetch = ExpoImage.prefetch;

export const Image = forwardRef<any, ImageProps>((props, ref) => {
  const { style, ...rest } = props;
  const placeholderSrc = rest.image?.sizes?.thumbnail?.url;

  return (
    <ExpoImage
      {...(rest as ExpoImageProps)}
      placeholder={rest.placeholder ?? placeholderSrc}
      ref={ref}
      transition={300}
      cachePolicy={props.cachePolicy ?? 'memory-disk'}
      style={style as any}
    />
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