import { Image, ImageStyle } from "expo-image";

type Props = {
  size: number;
  style?: ImageStyle;
  blurRadius?: number;
}

export const Credits = ({ size = 24, style, blurRadius = 0 }: Props) => {
  return (
    <Image
      blurRadius={blurRadius}
      style={[style, {
        height: size,
        width: size,
      }]}
      source={require('assets/images/credits.webp')}
    />
  )
}