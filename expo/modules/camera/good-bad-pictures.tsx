import { Check, X } from "@ui/icons";
import { Image } from "@ui/image";
import { ComponentProps } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Colors } from "theme";

const styles = StyleSheet.create({
  goodBadPicturesImage: {
    width: 82,
    height: 82,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.blur.medium,
    overflow: 'hidden',
  }
})

type ImageSource = ComponentProps<typeof Image>['source'];

type Props = {
  badPictures: [ImageSource, ImageSource],
  goodPicture: ImageSource,
  style?: ViewStyle;
}

export const GoodBadPictures = ({ badPictures, goodPicture, style }: Props) => {
  return (
    <View style={[{
      flexDirection: 'row',
      paddingHorizontal: 32,
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingTop: 16,
      flex: 1,
    }, style]}>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        <View style={{ transform: [{ rotate: '-3deg' }] }}>
          <Image
            source={badPictures[0]}
            style={styles.goodBadPicturesImage}
          />
        </View>
        <View style={{ transform: [{ rotate: '3deg' }] }}>
          <Image
            source={badPictures[1]}
            style={styles.goodBadPicturesImage}
          />
        </View>
        <View style={{
          position: 'absolute',
          top: -24,
          insetInline: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <X
            size={48}
            color={Colors.destructive[500]}
          />
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        <Image
          source={goodPicture}
          style={styles.goodBadPicturesImage}
        />
        <View style={{
          position: 'absolute',
          top: -24,
          insetInline: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Check
            size={48}
            color={Colors.primary[500]}
          />
        </View>
      </View>
    </View>
  )
}