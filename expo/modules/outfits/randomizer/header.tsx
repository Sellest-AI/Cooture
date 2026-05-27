import { Block } from "@ui/block";
import { Image } from "@ui/image";
import { Text } from "@ui/text";
import { useState } from "react";
import { View, ViewStyle } from "react-native";
import { Colors } from "theme";

const SENTENCES = [
  "What do you think of this outfit for today ?",
  "How do you like this look for today ?",
  "Is this outfit a vibe for today ?",
  "Ready to rock this outfit today ?",
  "Feeling this outfit for today ?",
]

type Props = {
  style?: ViewStyle;
}

export const RandomizerHeader = ({ style }: Props) => {
  const [sentenceIndex] = useState(new Date().getDate() % SENTENCES.length);
  const sentence = SENTENCES[sentenceIndex];

  return (
    <View style={[{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    }, style]}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        gap: 12
      }}>
        <View style={{
          top: 0, left: 2,
          width: 28, height: 28,
          borderRadius: 99,
          backgroundColor: Colors.blur.dark,
          overflow: 'hidden'
        }}>
          <Image
            source={require('assets/images/icon.png')}
            style={{ flex: 1 }}
          />
        </View>
        <Block
          variant="blur"
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 16,
            borderBottomLeftRadius: 4,
            maxWidth: 248
          }}>
          <Text.Base color={Colors.neutral[200]}>
            {sentence}
            {/* <Text.Base color={Colors.neutral[400]} style={{ paddingLeft: 4 }}>
              ☀️ 30°C
            </Text.Base> */}
          </Text.Base>
        </Block>
      </View>
    </View>
  )
}