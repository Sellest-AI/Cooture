import { Download, Loader } from "@ui/icons";
import { Pressable } from "@ui/pressable";
import { ComponentProps, useState } from "react";
import { View, ViewStyle } from "react-native";
import { Colors } from "theme";
import { Block } from "../block";
import { Roundish } from "../icons/roundish";
import { Image } from "../image";
import { Text } from "../text";

type ImageGenerationProps = {
  text?: string;
  /** Very useful in a carousel where the image is scaled down */
  textScale?: number;
  source: ComponentProps<typeof Image>['source'];
  loading?: boolean;
  style?: ViewStyle;
  disabled?: boolean;
  onDownload?: () => void;
  onPresss?: () => void;
}

export const ImageGeneration = ({ text, textScale = 1, source, disabled, loading, style, onDownload, onPresss }: ImageGenerationProps) => {
  const [downloading, setDownloading] = useState(false);

  return (
    <Pressable
      style={{ flex: 1, width: '100%' }}
      onPress={onPresss}
    >
      <Block
        variant="blur"
        style={{
          borderRadius: 24,
          aspectRatio: 3 / 4,
          width: '100%',
          pointerEvents: 'none',
          ...style
        }}
      >
        <Image
          source={source}
          blurRadius={loading ? 24 : 0}
          style={{
            opacity: loading ? 0.6 : 1,
            width: '100%',
            height: '100%',
          }}
        />
        {loading && <Roundish
          color={Colors.primary[500]}
          strokeColor={Colors.primary[700]}
          strokeWidth={2}
          animate={loading}
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            top: 0,
            right: 0,
            left: 0,
            bottom: 0,
          }}
        />}
      </Block>
      {(text || onDownload) && <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        paddingHorizontal: 8,
      }}>
        {text && <Text.Base
          style={{
            flexShrink: 0,
            color: Colors.neutral[400],
            transform: [{ scale: textScale }],
            transformOrigin: 'left top',
          }}
        >
          {text}
        </Text.Base>}
        {onDownload &&
          <View style={{ width: 20, height: 20 }}>
            <Pressable style={{
              width: 32,
              height: 32,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              top: -4,
              left: -8,
            }}
              onPress={async () => {
                setDownloading(true);
                await onDownload();
                setDownloading(false);
              }}
            >
              {downloading ?
                <Loader color={Colors.primary[500]} size={20} /> :
                <Download color={Colors.primary[500]} size={20} />}
            </Pressable>
          </View>
        }
      </View>}
    </Pressable>
  )
}