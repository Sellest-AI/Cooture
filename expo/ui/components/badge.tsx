import { ComponentProps } from "react";
import { ViewStyle } from "react-native";
import { Colors } from "theme";
import { Block } from "./block";
import { Image } from "./image";
import { Text } from './text';

type Props = {
  source?: ComponentProps<typeof Image>['source'];
  contentFit?: "cover" | "contain";
  contentPosition?: ComponentProps<typeof Image>['contentPosition'];
  style?: ViewStyle;
  text?: string;
}

export const Badge = ({ source, contentFit = "cover", contentPosition, style, text }: Props) => {
  return (
    <Block
      variant="blur"
      style={{
        borderRadius: 99,
        padding: contentFit === "contain" ? 8 : 0,
        overflow: "hidden",
        width: 46,
        height: 46,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 0,
        ...style
      }}
    >
      {source && <Image
        source={source}
        contentFit={contentFit}
        contentPosition={contentPosition}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
      />}
      {text && <Text.Base
        style={{
          fontWeight: 700,
          color: Colors.neutral[400],
          position: 'absolute',
          textAlign: 'center',
        }}
      >
        {text}
      </Text.Base>}
    </Block>
  )
}